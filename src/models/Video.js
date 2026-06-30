const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  videoId:      { type: String, unique: true },
  title:        { type: String },
  description:  { type: String },
  thumbnail:    { type: String },
  channelId:    { type: String },
  channelTitle: { type: String },
  publishedAt:  { type: String },
  viewCount:    { type: String },
  likeCount:    { type: String },
  duration:     { type: String },
  tags:         { type: [String], default: [] },
  category:     { type: String, default: 'general' },
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);