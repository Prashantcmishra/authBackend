import express from "express";

const {
  getVideos,
  getVideoById,
  searchVideos,
  fetchVideos,
} = require('../controllers/videoController');

const router  = express.Router();

router.get('/',        getVideos);      // GET  /api/videos
router.get('/search',  searchVideos);   // GET  /api/videos/search?q=react
router.get('/:id',     getVideoById);   // GET  /api/videos/:id
router.post('/fetch',   fetchVideos);    // POST /api/videos/fetch

export default router;