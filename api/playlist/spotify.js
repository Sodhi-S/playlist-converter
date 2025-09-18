const express = require('express');
const router = express.Router();
const spotifyBackend = require('../../backend/spotify');

// Placeholder for Spotify playlist fetch logic
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Spotify playlist fetch endpoint' });
});

module.exports = router;
