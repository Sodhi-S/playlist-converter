const express = require('express');
const router = express.Router();
const soundcloudBackend = require('../../backend/soundcloud');

// Placeholder for SoundCloud playlist fetch logic
router.get('/', (req, res) => {
  res.status(200).json({ message: 'SoundCloud playlist fetch endpoint' });
});

module.exports = router;
