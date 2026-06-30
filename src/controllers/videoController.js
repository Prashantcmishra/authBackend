const Video from '../models/Video.js';
const { fetchAndSaveVideos, formatViews } from '../services/youtubeService.js';

// ─── GET /api/videos ─────────────────────────────────────────
// Returns videos from MongoDB
const getVideos = async (req, res) => {
  try {
    const { category = 'trending', page = 1, limit = 20 } = req.query;

    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const videos = await Video.find({ category })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Format for frontend
    const formatted = videos.map((v) => ({
      id:           v.videoId,
      title:        v.title,
      thumbnail:    v.thumbnail,
      channel:      v.channelTitle,
      views:        formatViews(v.viewCount),
      publishedAt:  v.publishedAt,
      duration:     v.duration,
      description:  v.description,
    }));

    res.json({ success: true, videos: formatted });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/videos/:id ─────────────────────────────────────
// Returns single video detail
const getVideoById = async (req, res) => {
  try {
    const video = await Video.findOne({ videoId: req.params.id });
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    res.json({
      success: true,
      video: {
        id:           video.videoId,
        title:        video.title,
        thumbnail:    video.thumbnail,
        channel:      video.channelTitle,
        channelId:    video.channelId,
        views:        formatViews(video.viewCount),
        likes:        video.likeCount,
        publishedAt:  video.publishedAt,
        duration:     video.duration,
        description:  video.description,
      },
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/videos/search?q=react ──────────────────────────
const searchVideos = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Query required' });

    const videos = await Video.find({
      title: { $regex: q, $options: 'i' },
    }).limit(20);

    const formatted = videos.map((v) => ({
      id:          v.videoId,
      title:       v.title,
      thumbnail:   v.thumbnail,
      channel:     v.channelTitle,
      views:       formatViews(v.viewCount),
      publishedAt: v.publishedAt,
      duration:    v.duration,
    }));

    res.json({ success: true, videos: formatted });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/videos/fetch ──────────────────────────────────
// Admin trigger - fetch from YouTube and save to MongoDB
const fetchVideos = async (req, res) => {
  try {
    const { query = 'trending', maxResults = 20 } = req.body;
    const videos = await fetchAndSaveVideos(query, maxResults);
    res.json({ success: true, message: `Fetched ${videos.length} videos`, videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getVideos, getVideoById, searchVideos, fetchVideos };