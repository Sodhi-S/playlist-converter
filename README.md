# Spotify to SoundCloud Playlist Converter (Frontend)

A React/Next.js frontend application for converting Spotify playlists to SoundCloud playlists.

## 🚀 Features

- **OAuth Authentication** - Connect your Spotify and SoundCloud accounts
- **Playlist Selection** - Browse and select from your Spotify playlists
- **Smart Track Matching** - Advanced algorithms to find equivalent tracks on SoundCloud
- **Real-time Progress** - Live conversion progress with detailed match results
- **Error Handling** - Comprehensive error recovery and user feedback
- **Responsive Design** - Works on desktop and mobile devices

## 🛠️ Setup

### Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`env
# Spotify API
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id

# SoundCloud API  
NEXT_PUBLIC_SOUNDCLOUD_CLIENT_ID=your_soundcloud_client_id

# Your Backend API URL (optional - falls back to direct API calls)
NEXT_PUBLIC_API_URL=https://your-backend-api.com
\`\`\`

### Backend API (Optional)

This frontend can work in two modes:

1. **With Backend API** - Set `NEXT_PUBLIC_API_URL` to your backend that handles:
   - OAuth token exchange
   - API rate limiting
   - CORS handling
   - Secure API key management

2. **Direct API Mode** - Leave `NEXT_PUBLIC_API_URL` empty to make direct calls to Spotify/SoundCloud APIs
   - Note: This may have CORS limitations
   - Requires client-side API keys (less secure)

### Required API Endpoints (if using backend)

Your backend should implement these endpoints:

\`\`\`
GET  /spotify/playlists
GET  /spotify/playlist/:id
GET  /soundcloud/search?q=query
POST /soundcloud/playlists
GET  /soundcloud/me
POST /auth/spotify/callback
POST /auth/soundcloud/callback
\`\`\`

## 🔧 Development

\`\`\`bash
npm install
npm run dev
\`\`\`

## 📱 Usage

1. **Connect Accounts** - Authenticate with both Spotify and SoundCloud
2. **Select Playlist** - Choose a Spotify playlist to convert
3. **Start Conversion** - Watch as tracks are matched and converted
4. **View Results** - See detailed match results and access your new SoundCloud playlist

## 🎯 Track Matching Algorithm

The converter uses multiple strategies to find the best matches:

- **Exact matching** - Title and artist combinations
- **Fuzzy matching** - Handles variations in spelling and formatting
- **Duration comparison** - Validates matches using track length
- **Multiple search queries** - Tries different search patterns
- **Score-based ranking** - Selects the best match from multiple candidates

## 🚧 Limitations

- **CORS Issues** - Direct API mode may face browser CORS restrictions
- **Rate Limits** - API calls are subject to Spotify/SoundCloud rate limits
- **Match Accuracy** - Not all tracks may have exact equivalents on both platforms
- **Authentication** - Tokens may expire and require re-authentication

## 🔒 Security Notes

- API keys are exposed in client-side code when using direct mode
- Use a backend API for production deployments
- Implement proper token refresh mechanisms
- Consider rate limiting and abuse prevention
