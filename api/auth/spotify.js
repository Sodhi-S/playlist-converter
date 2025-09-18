const express = require('express');
const router = express.Router();
const { spotifyConfig } = require('../../backend/spotify');
const axios = require('axios');
const querystring = require('querystring');

// 1. Login route: Redirect user to Spotify's authorization page
router.get('/login', (req, res) => {
  const scope = 'playlist-read-private playlist-read-collaborative';
  const params = querystring.stringify({
    response_type: 'code',
    client_id: spotifyConfig.clientId,
    scope: scope,
    redirect_uri: spotifyConfig.redirectUri,
    state: 'some-random-state', // In production, generate and validate this
  });
  const authUrl = `https://accounts.spotify.com/authorize?${params}`;
  res.redirect(authUrl);
});

// 2. Callback route: Handle Spotify redirect and exchange code for token
router.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: spotifyConfig.redirectUri,
        client_id: spotifyConfig.clientId,
        client_secret: spotifyConfig.clientSecret,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, refresh_token } = tokenResponse.data;
    res.json({ access_token, refresh_token });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get token', details: err.message });
  }
});

module.exports = router;
