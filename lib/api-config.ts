export const API_CONFIG = {
  // Replace these with your actual backend API endpoints
  SPOTIFY: {
    PLAYLISTS: process.env.NEXT_PUBLIC_API_URL + "/spotify/playlists",
    PLAYLIST_DETAILS: process.env.NEXT_PUBLIC_API_URL + "/spotify/playlist",
    AUTH_CALLBACK: process.env.NEXT_PUBLIC_API_URL + "/auth/spotify/callback",
  },
  SOUNDCLOUD: {
    SEARCH: process.env.NEXT_PUBLIC_API_URL + "/soundcloud/search",
    PLAYLISTS: process.env.NEXT_PUBLIC_API_URL + "/soundcloud/playlists",
    USER: process.env.NEXT_PUBLIC_API_URL + "/soundcloud/me",
    AUTH_CALLBACK: process.env.NEXT_PUBLIC_API_URL + "/auth/soundcloud/callback",
  },
}

// Fallback to placeholder URLs if no backend is configured
export const getApiUrl = (endpoint: string) => {
  return process.env.NEXT_PUBLIC_API_URL
    ? endpoint
    : "https://your-backend-api.com" + endpoint.replace(process.env.NEXT_PUBLIC_API_URL || "", "")
}
