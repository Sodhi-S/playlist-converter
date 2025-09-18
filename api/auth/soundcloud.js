const express = require('express');
const router = express.Router();
const soundcloudBackend = require('../../backend/soundcloud');
const { soundcloudConfig } = require('../../backend/soundcloud');
console.log('SoundCloud API Config:', soundcloudConfig);

// Placeholder for SoundCloud OAuth logic
router.get('/', (req, res) => {
  res.status(200).json({ message: 'SoundCloud OAuth endpoint' });
});

module.exports = router;
