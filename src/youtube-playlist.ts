import axios from "axios";
import * as cheerio from "cheerio";
import logger from "logger";

interface YouTubeVideo {
  title: string;
  url: string;
}

let youtubeCache: {
  videos: YouTubeVideo[];
  lastFetched: number;
} | null = null;

const YOUTUBE_CACHE_MINUTES = 10;
const PLAYLIST_ID = "PLEKTcA5lfrkyDvi4zRCO1CKDFzXIL8xd0"; // Good practice

export async function getYouTubePlaylist(
  playlistId: string = PLAYLIST_ID // Use default value
): Promise<YouTubeVideo[]> {
  try {
    const currentTime = Date.now();
    const cacheExpiration = YOUTUBE_CACHE_MINUTES * 60 * 1000;

    if (
      youtubeCache &&
      currentTime - youtubeCache.lastFetched < cacheExpiration
    ) {
      logger.debug("Returning cached YouTube playlist data");
      return youtubeCache.videos;
    }

    logger.debug("Fetching fresh YouTube playlist data");
    const videos = await fetchYouTubePlaylist(playlistId);

    youtubeCache = {
      videos,
      lastFetched: currentTime,
    };

    return videos;
  } catch (error) {
    logger.error("Error fetching YouTube playlist:", error);
    throw new Error("Failed to fetch YouTube playlist");
  }
}

async function fetchYouTubePlaylist(
  playlistId: string
): Promise<YouTubeVideo[]> {
  try {
    const response = await axios.get(
      `https://www.youtube.com/playlist?list=${playlistId}`
    );
    const $ = cheerio.load(response.data);
    const videos: YouTubeVideo[] = [];

    logger.debug(`HTML content length: ${response.data.length}`);

    // More robust selector and attribute extraction
    $("li.playlist-video-item-container").each((index, element) => {
      // Target list items
      const linkElement = $(element).find("a.playlist-video-title"); // Find title link *within* the item
      const title = linkElement.attr("title")?.trim(); // Use optional chaining
      const href = linkElement.attr("href");

      logger.debug(`Processing element ${index}: title=${title}, href=${href}`);

      if (title && href) {
        // Extract video ID and construct a clean URL
        const videoIdMatch = href.match(/v=([^&]+)/); // Use regex to get video ID
        if (videoIdMatch) {
          const videoId = videoIdMatch[1];
          const fullUrl = `https://www.youtube.com/watch?v=${videoId}`;
          videos.push({
            title,
            url: fullUrl,
          });
          logger.debug(`Added video: title=${title}, url=${fullUrl}`);
        } else {
          logger.warn(
            `Skipping element ${index}: Could not extract video ID from href=${href}`
          );
        }
      } else {
        logger.warn(`Skipping element ${index}: Missing title or href`);
      }
    });

    logger.debug(`Found ${videos.length} videos`);
    return videos;
  } catch (error) {
    logger.error("Error fetching or parsing YouTube playlist:", error); // More specific error
    throw new Error("Failed to fetch YouTube playlist"); // Consistent error message
  }
}
