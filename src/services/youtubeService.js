import axios from 'axios';
import Video from '../models/videoModel.js';

const API_KEY  = process.env.YOUTUBE_API_KEY;
const BASE_URL = process.env.YOUTUBE_BASE_URL;

// ─── 1. Search videos from YouTube ───────────────────────────
const searchFromYouTube = async (query = 'trending', maxResults = 20) => {
  const response = await axios.get(`${BASE_URL}/search`, {
    params: {
      part:       'snippet',
      q:          query,
      type:       'video',
      maxResults,
      key:        API_KEY,
    },
  });
  return response.data.items; // array of videos
};

// ─── 2. Get video stats (views, likes, duration) ─────────────
const getVideoStats = async (videoIds) => {
  const ids = videoIds.join(',');
  const response = await axios.get(`${BASE_URL}/videos`, {
    params: {
      part: 'statistics,contentDetails',
      id:   ids,
      key:  API_KEY,
    },
  });
  return response.data.items;
};

// ─── 3. Format duration  PT1H2M3S → 1:02:03 ─────────────────
const formatDuration = (isoDuration) => {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  const h = parseInt(match[1] || 0);
  const m = parseInt(match[2] || 0);
  const s = parseInt(match[3] || 0);
  if (h > 0) {
    return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  return `${m}:${String(s).padStart(2,'0')}`;
};

// ─── 4. Fetch + Save to MongoDB ──────────────────────────────
const fetchAndSaveVideos = async (query = 'trending', maxResults = 20) => {
  try {
    // Step 1 - search
    const searchResults = await searchFromYouTube(query, maxResults);

    // Step 2 - get all video ids
    const videoIds = searchResults.map((item) => item.id.videoId).filter(Boolean);

    // Step 3 - get stats for all videos
    const statsResults = await getVideoStats(videoIds);

    // Step 4 - merge and save
    const savedVideos = [];

    for (const item of searchResults) {
      const videoId = item.id.videoId;
      if (!videoId) continue;

      const stats = statsResults.find((s) => s.id === videoId);

      const videoData = {
        videoId,
        title:        item.snippet.title,
        description:  item.snippet.description,
        thumbnail:    item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        channelId:    item.snippet.channelId,
        channelTitle: item.snippet.channelTitle,
        publishedAt:  item.snippet.publishedAt,
        viewCount:    stats?.statistics?.viewCount    || '0',
        likeCount:    stats?.statistics?.likeCount    || '0',
        duration:     formatDuration(stats?.contentDetails?.duration || 'PT0S'),
        category:     query,
      };

      // upsert - update if exists, insert if not
      await Video.findOneAndUpdate(
        { videoId },
        videoData,
        { upsert: true, new: true }
      );

      savedVideos.push(videoData);
    }

    console.log(`✅ Saved ${savedVideos.length} videos for query: "${query}"`);
    return savedVideos;

  } catch (error) {
    console.error('YouTube fetch error:', error.message);
    throw error;
  }
};

// ─── 5. Format view count  1200000 → 1.2M ───────────────────
const formatViews = (count) => {
  const num = parseInt(count || 0);
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M views';
  if (num >= 1000)    return (num / 1000).toFixed(1)    + 'K views';
  return num + ' views';
};

module.exports = {
  fetchAndSaveVideos,
  formatViews,
};