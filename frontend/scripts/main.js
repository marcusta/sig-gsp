const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

// Configuration
const config = {
    baseDirectory: 'd:/sig/gspro-prefetcher/sgt/',
    coursesUrl: 'https://simulatorgolftour.com/sgt-api/courses/list?_=1727193337239',
    courseManifestUrl: 'https://simulatorgolftour.com/course_manifest.json',
    targetUrl: 'https://app.swedenindoorgolf.se/gsp/api/update-from-filesystem',
    syncListUrl: 'https://app.swedenindoorgolf.se/gsp/api/course-sync-list'
};

// Add to the top of the file, after config
const SYNC_MODES = {
    DELTA: 'delta',
    FULL: 'full'
};

// Logging helper
const log = {
    info: (message) => console.log(`[INFO] ${message}`),
    error: (message) => console.error(`[ERROR] ${message}`),
    progress: (current, total) => {
        const percentage = ((current / total) * 100).toFixed(2);
        process.stdout.write(`\r[PROGRESS] Processed ${current}/${total} (${percentage}%)`);
    }
};

// Helper Functions
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchCoursesHtml() {
    try {
        const response = await axios.get(config.coursesUrl);
        return response.data;
    } catch (error) {
        log.error(`Error fetching courses page: ${error.message}`);
        throw error;
    }
}

async function fetchSyncList() {
    try {
        const response = await axios.get(config.syncListUrl);
        return response.data;
    } catch (error) {
        log.error(`Error fetching sync list: ${error.message}`);
        throw error;
    }
}

function extractCoursesData(html) {
    const $ = cheerio.load(html);
    const courseData = {};
    $('div.course-card').each((index, element) => {
        const courseId = $(element).attr('data-course-id');
        const courseName = $(element).find('div[data-sort-key="NAME"]').text().trim();
        const lazyLoadUrl = $(element).find('.course-image').attr('data-lazyloadurl');
        const flyoverPath = $(element).find('div[data-action-type="flyover"]').attr('data-flyover-path');
        if (courseName && courseId) {
            courseData[courseName.toLowerCase()] = { courseId, lazyLoadUrl, flyoverPath };
        }
    });
    return courseData;
}

function findFileIgnoreCase(directoryPath, fileName) {
    const files = fs.readdirSync(directoryPath);
    const lowerFileName = fileName.toLowerCase();
    return files.find(file => file.toLowerCase() === lowerFileName);
}

function getCourseNameFromGkd(directoryPath, directoryName) {
    const gkdFileName = findFileIgnoreCase(directoryPath, `${directoryName}.gkd`);
    if (gkdFileName) {
        const gkdFilePath = path.join(directoryPath, gkdFileName);
        const fileContents = fs.readFileSync(gkdFilePath, 'utf-8');
        const jsonData = JSON.parse(fileContents);
        return jsonData.CourseName.trim();
    }
    return null;
}

function getDirectoryDates(directoryPath) {
    const files = fs.readdirSync(directoryPath).map(file => path.join(directoryPath, file));
    const stats = files.map(file => fs.statSync(file));
    const oldestFile = stats.reduce((oldest, current) => current.birthtime < oldest.birthtime ? current : oldest);
    const newestFile = stats.reduce((newest, current) => current.mtime > newest.mtime ? current : newest);
    return {
        added: oldestFile.birthtime.toISOString(),
        updated: newestFile.mtime.toISOString()
    };
}

function getOpcdVersion(directoryPath) {
    const files = fs.readdirSync(directoryPath);
    if (files.some(file => file.toLowerCase().endsWith('.gspcrse'))) return 'v4';
    if (files.some(file => file.toLowerCase().endsWith('.unity3d'))) return 'v3';
    return 'v2';
}

function calculateCoursePar(gkdData) {
    if (!gkdData.Holes || !Array.isArray(gkdData.Holes)) {
        log.error('No valid Holes data found in GKD file');
        return null;
    }

    return gkdData.Holes.reduce((totalPar, hole) => {
        if (hole.Enabled && typeof hole.Par === 'number') {
            return totalPar + hole.Par;
        }
        return totalPar;
    }, 0);
}

async function postData(data) {
    try {
        const response = await axios.post(config.targetUrl, data, {
            headers: { 'Content-Type': 'application/json' }
        });
        log.info(`Successfully posted data for "${data.courseName}": Status ${response.status}`);
        log.info(`Response body: ${JSON.stringify(response.data, null, 2)}`);
        return response;
    } catch (error) {
        log.error(`Error posting data for "${data.courseName}": ${error.message}`);
        throw error;
    }
}

// Add new function to fetch course manifest
async function fetchCourseManifest() {
    try {
        const response = await axios.get(config.courseManifestUrl);
        // Create a map using CourseFolder as key for easy lookup
        return new Map(response.data.map(course => [course.CourseFolder.toLowerCase(), course]));
    } catch (error) {
        log.error(`Error fetching course manifest: ${error.message}`);
        throw error;
    }
}

// Main processing function
function processDirectory(directoryName, courseData, syncListItem, syncMode, courseManifest) {
    const directoryPath = path.join(config.baseDirectory, directoryName);
    
    // Look up course in manifest first
    const manifestInfo = courseManifest.get(directoryName.toLowerCase());
    // Use manifest name if available, otherwise fall back to GKD name
    const courseName = manifestInfo ? manifestInfo.Name : getCourseNameFromGkd(directoryPath, directoryName);

    if (!courseName) {
        log.error(`No valid course name found for "${directoryName}", skipping...`);
        return null;
    }

    const { added, updated } = getDirectoryDates(directoryPath);
    
    // Check if the course needs to be synced - only in delta mode
    if (syncMode === SYNC_MODES.DELTA && syncListItem) {
        if (syncListItem.addedDate === added && syncListItem.updatedDate === updated) {
            return null;
        }
    }

    const opcdVersion = getOpcdVersion(directoryPath);
    const courseInfo = courseData[courseName.toLowerCase()];
    const sgtId = manifestInfo ? manifestInfo.courseId.toString() : '';

    const gkdFileName = findFileIgnoreCase(directoryPath, `${directoryName}.gkd`);
    const gkdFilePath = path.join(directoryPath, gkdFileName);
    const gkdFileContents = fs.readFileSync(gkdFilePath, 'utf-8');
    const gkdData = JSON.parse(gkdFileContents);

    const coursePar = calculateCoursePar(gkdData);

    return {
        courseName: courseName,
        opcdName: directoryName,
        gkdFileContents: gkdData,
        coursePar: coursePar,
        sgtInfo: {
            sgtId: sgtId,
            sgtSplashUrl: courseInfo?.lazyLoadUrl || '',
            sgtYoutubeUrl: courseInfo?.flyoverPath || ''
        },
        opcdInfo: {
            addedDate: added,
            updatedDate: updated,
            opcdVersion: opcdVersion
        }
    };
}

// Main execution function
async function main(specificDirectory = null, syncMode = SYNC_MODES.DELTA) {
    const errors = [];
    const processed = [];
    const skipped = [];
    try {
        log.info(`Starting ${syncMode} sync...`);
        const [coursesHtml, courseManifest] = await Promise.all([
            fetchCoursesHtml(),
            fetchCourseManifest()
        ]);
        const courseData = extractCoursesData(coursesHtml);

        log.info("Fetching sync list...");
        const syncList = await fetchSyncList();
        const syncMap = new Map(syncList.map(item => [item.opcdName.toLowerCase(), item]));

        let directories;
        if (specificDirectory) {
            directories = [specificDirectory];
        } else {
            directories = fs.readdirSync(config.baseDirectory, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);
        }

        const totalDirectories = directories.length;
        log.info(`Starting processing. Total directories to process: ${totalDirectories}`);

        for (let i = 0; i < totalDirectories; i++) {
            const syncListItem = syncMap.get(directories[i].toLowerCase());
            try {
                const data = processDirectory(
                    directories[i], 
                    courseData, 
                    syncListItem, 
                    syncMode,
                    courseManifest
                );
                if (data) {
                    const response = await postData(data);
                    processed.push({
                        directory: directories[i],
                        status: response.status,
                        courseName: data.courseName
                    });
                    await sleep(100);
                } else if (syncMode === SYNC_MODES.DELTA && syncListItem) {
                    skipped.push(directories[i]);
                } else {
                    errors.push({ directory: directories[i], error: "Invalid or missing GKD file" });
                }
            } catch (error) {
                errors.push({ directory: directories[i], error: error.message });
            }
            log.progress(i + 1, totalDirectories);
        }

        console.log("\n"); // New line after progress bar
        log.info("Processing and data sending complete.");
        log.info(`Total directories: ${totalDirectories}`);
        log.info(`Successfully processed: ${processed.length}`);
        log.info(`Skipped (up to date): ${skipped.length}`);
        log.info(`Errors encountered: ${errors.length}`);

        if (errors.length > 0) {
            log.info("Directories with errors:");
            errors.forEach(err => log.error(`${err.directory}: ${err.error}`));
        }

        log.info("Successfully processed directories:");
        processed.forEach(p => log.info(`${p.directory} (${p.courseName}): HTTP ${p.status}`));

        // log.info("Skipped directories (up to date):");
        //skipped.forEach(dir => log.info(dir));

    } catch (error) {
        log.error(`An error occurred during execution: ${error.message}`);
    }
}

// Usage
const args = process.argv.slice(2);
const specificDirectory = args[0];
const syncMode = args[1]?.toLowerCase() === 'full' ? SYNC_MODES.FULL : SYNC_MODES.DELTA;
main(specificDirectory, syncMode);