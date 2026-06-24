/**
 * Course manifest sync
 *
 * SGT publishes a lightweight catalogue of every course at
 * https://simulatorgolftour.com/course_manifest.json. Each entry's `courseId`
 * is the same SGT course id used by the records feed and by our `courses.sgtId`.
 *
 * The full course data (holes, tee boxes, GKD) is pushed to us separately by an
 * external collector machine via /api/update-from-filesystem. That machine can
 * be down or lag behind, so courses (and their newly-set records) can exist on
 * SGT before we have them - which means the records scraper silently drops
 * those records.
 *
 * This sync closes that gap: it pre-seeds a skeleton course row (linked by
 * sgtId) for every manifest course we don't have yet, so the records scraper
 * always has somewhere to attach records. Skeletons carry `holes = 0` as a
 * marker; they are hidden from the course browser until the collector later
 * enriches them with real GKD data (matched by name in update-from-filesystem,
 * which keeps the sgtId we set here).
 */

import axios from "axios";
import { eq } from "drizzle-orm";
import { db } from "./db/db";
import { courses } from "./db/schema";
import logger from "./logger";

const MANIFEST_URL = "https://simulatorgolftour.com/course_manifest.json";
// The course list page's XHR feed. Includes courses distributed by GSPro
// directly (not via SGT) which are absent from course_manifest.json but still
// have records on SGT - e.g. "The Golf Club at the Highlands" (3427). We union
// its lightweight {name, courseId} entries in so those courses get skeletons.
const PAGE_DATA_URL =
  "https://simulatorgolftour.com/sgt-api/courses/page-data";

/** Build the splash URL SGT uses, by course id (same pattern as the manifest). */
function splashUrlFor(courseId: number | string): string {
  return `https://simulatorgolftour.com/public/assets/courseImages/splashes/cmp/splash_${courseId}.jpg?v=1.1`;
}

/** Subset of manifest fields we use to seed a skeleton course. */
interface ManifestCourse {
  courseId: number;
  Name: string;
  CourseLocation?: string;
  City?: string;
  State?: string;
  Country?: string;
  Description?: string;
  CourseDesigner?: string;
  Par?: number;
  ElevationInFeet?: number;
  remoteThumbnailImage?: string;
  LastUpdated?: string;
}

/** Subset of the page-data XHR feed we use. */
interface PageDataResponse {
  map?: { name: string; courseId: number }[];
}

export interface ManifestSyncResult {
  /** Total courses considered (manifest + page-data-only) */
  total: number;
  /** Courses sourced only from page-data (GSPro-distributed, not in manifest) */
  fromPageData: number;
  /** Existing unlinked courses we matched by name and set sgtId on */
  linked: number;
  /** New skeleton courses inserted */
  created: number;
  /** Manifest courses we already had linked by sgtId (no-op) */
  skipped: number;
  errors: string[];
}

/** Normalize a course name for matching (lowercase, alphanumerics only). */
function normalizeCourseName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Fetch the SGT course manifest and ensure every course exists and is linked
 * to its sgtId. Never throws on a fetch failure - returns the error in the
 * result so a caller (e.g. the records scrape) can carry on.
 */
export async function syncCourseManifest(): Promise<ManifestSyncResult> {
  const result: ManifestSyncResult = {
    total: 0,
    fromPageData: 0,
    linked: 0,
    created: 0,
    skipped: 0,
    errors: [],
  };

  let manifest: ManifestCourse[];
  try {
    const response = await axios.get(MANIFEST_URL, {
      timeout: 30000,
      headers: { "User-Agent": "GSPro-Course-Viewer/1.0" },
    });
    if (!Array.isArray(response.data)) {
      throw new Error("manifest response was not an array");
    }
    manifest = response.data as ManifestCourse[];
  } catch (error) {
    const msg = `Manifest fetch failed: ${error}`;
    logger.error(msg);
    result.errors.push(msg);
    return result;
  }

  // Union in courses that only appear in the course list page's XHR feed
  // (GSPro-distributed courses missing from the manifest). Non-fatal: if this
  // fetch fails we still proceed with the manifest alone.
  try {
    const manifestIds = new Set(manifest.map((c) => c.courseId));
    const pdResponse = await axios.get(PAGE_DATA_URL, {
      timeout: 30000,
      headers: {
        "User-Agent": "GSPro-Course-Viewer/1.0",
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    const pageMap = (pdResponse.data as PageDataResponse)?.map ?? [];
    for (const pc of pageMap) {
      if (!pc.courseId || !pc.name || manifestIds.has(pc.courseId)) continue;
      manifestIds.add(pc.courseId);
      manifest.push({
        courseId: pc.courseId,
        Name: pc.name,
        remoteThumbnailImage: splashUrlFor(pc.courseId),
      });
      result.fromPageData++;
    }
    if (result.fromPageData > 0) {
      logger.info(
        `Manifest sync: +${result.fromPageData} courses from page-data not in manifest`
      );
    }
  } catch (error) {
    logger.warn(`Page-data union skipped (non-fatal): ${error}`);
  }

  result.total = manifest.length;

  // Load our current courses once.
  const allCourses = await db.query.courses.findMany({
    columns: { id: true, name: true, sgtId: true },
  });

  const existingSgtIds = new Set<string>();
  for (const c of allCourses) {
    if (c.sgtId && c.sgtId.trim() !== "") existingSgtIds.add(c.sgtId.trim());
  }

  // Unlinked courses keyed by normalized name, one-to-one only (names shared by
  // multiple unlinked courses are ambiguous and dropped to avoid mis-linking).
  const unlinkedByName = new Map<string, { id: number }>();
  const ambiguousNames = new Set<string>();
  for (const c of allCourses) {
    if (c.sgtId && c.sgtId.trim() !== "") continue;
    const key = normalizeCourseName(c.name);
    if (!key) continue;
    if (unlinkedByName.has(key)) {
      ambiguousNames.add(key);
      continue;
    }
    unlinkedByName.set(key, { id: c.id });
  }
  for (const key of ambiguousNames) unlinkedByName.delete(key);

  const now = new Date().toISOString();

  await db.transaction(async (tx) => {
    for (const mc of manifest) {
      try {
        if (!mc.courseId || !mc.Name) continue;
        const sgtId = String(mc.courseId);

        // Already linked - nothing to do.
        if (existingSgtIds.has(sgtId)) {
          result.skipped++;
          continue;
        }

        // We have this course by name but it was never linked - link it.
        const nameKey = normalizeCourseName(mc.Name);
        const candidate = nameKey ? unlinkedByName.get(nameKey) : undefined;
        if (candidate) {
          await tx
            .update(courses)
            .set({ sgtId })
            .where(eq(courses.id, candidate.id));
          existingSgtIds.add(sgtId);
          unlinkedByName.delete(nameKey);
          result.linked++;
          continue;
        }

        // Brand new course - insert a skeleton (holes = 0 until enriched).
        const location =
          mc.CourseLocation ||
          [mc.City, mc.State, mc.Country].filter(Boolean).join(", ") ||
          "-";
        await tx.insert(courses).values({
          name: mc.Name,
          location,
          country: mc.Country || "USA",
          holes: 0,
          altitude: mc.ElevationInFeet ?? 0,
          designer: mc.CourseDesigner || "-",
          description: mc.Description || "-",
          par: mc.Par ?? 72,
          sgtId,
          sgtSplashUrl: mc.remoteThumbnailImage || "",
          addedDate: mc.LastUpdated || now,
          updatedDate: mc.LastUpdated || now,
          enabled: true,
        });
        existingSgtIds.add(sgtId);
        result.created++;
      } catch (rowError) {
        result.errors.push(
          `manifest course ${mc.courseId} (${mc.Name}): ${rowError}`
        );
      }
    }
  });

  logger.info(
    `Manifest sync: ${result.created} skeleton courses created, ` +
      `${result.linked} linked by name, ${result.skipped} already linked ` +
      `(of ${result.total} in manifest)`
  );
  if (result.errors.length > 0) {
    logger.warn(`Manifest sync encountered ${result.errors.length} row errors`);
  }

  return result;
}
