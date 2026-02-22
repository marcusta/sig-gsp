// CDN has hotlink protection (requires Referer: simulatorgolftour.com),
// so we use the origin server which serves /cmp/ images without restriction.
const SGT_SPLASH_ORIGIN = "https://simulatorgolftour.com";
const SGT_ORIGIN = "https://simulatorgolftour.com";
const SPLASH_PATH_PREFIX = "/public/assets/courseImages/splashes/";
const SPLASH_CMP_PATH_PREFIX = "/public/assets/courseImages/splashes/cmp/";

function appendVersion(url: string, version: string): string {
  if (url.includes("?")) return `${url}&v=${version}`;
  return `${url}?v=${version}`;
}

function toCdnSplashPath(pathname: string): string | null {
  if (!pathname.startsWith(SPLASH_PATH_PREFIX)) {
    return null;
  }

  // If path already uses /cmp/, keep it.
  if (pathname.startsWith(SPLASH_CMP_PATH_PREFIX)) {
    return pathname;
  }

  const filename = pathname.split("/").pop();
  if (!filename) {
    return null;
  }

  return `${SPLASH_CMP_PATH_PREFIX}${filename}`;
}

export function getSgtSplashUrl(
  input: string | null | undefined,
  options?: { fallback?: string; version?: string }
): string {
  const fallback =
    options?.fallback ?? `${SGT_ORIGIN}/public/home/tour-bg.jpg`;
  const version = options?.version ?? "1.0";

  if (!input || input.trim() === "") {
    return fallback;
  }

  const value = input.trim();

  // Relative path from DB
  if (value.startsWith("/")) {
    const cdnPath = toCdnSplashPath(value);
    if (cdnPath) {
      return appendVersion(`${SGT_SPLASH_ORIGIN}${cdnPath}`, version);
    }
    return `${SGT_ORIGIN}${value}`;
  }

  // Already absolute
  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      const cdnPath = toCdnSplashPath(parsed.pathname);
      if (cdnPath) {
        return appendVersion(`${SGT_SPLASH_ORIGIN}${cdnPath}`, version);
      }
      return value;
    } catch {
      return fallback;
    }
  }

  return fallback;
}
