// Frontend-only API client - connects to your backend
export class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  }

  // Spotify API methods - these will call your backend
  async getSpotifyPlaylists(token: string) {
    const response = await fetch(`${this.baseUrl}/api/spotify/playlists`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch Spotify playlists")
    }

    return response.json()
  }

  async getSpotifyPlaylist(token: string, playlistId: string) {
    const response = await fetch(`${this.baseUrl}/api/spotify/playlist/${playlistId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch Spotify playlist")
    }

    return response.json()
  }

  // SoundCloud API methods - these will call your backend
  async searchSoundCloudTrack(token: string, query: string) {
    const response = await fetch(`${this.baseUrl}/api/soundcloud/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error("Failed to search SoundCloud tracks")
    }

    return response.json()
  }

  async createSoundCloudPlaylist(token: string, title: string, description: string, trackIds: string[]) {
    const response = await fetch(`${this.baseUrl}/api/soundcloud/playlists`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description, trackIds }),
    })

    if (!response.ok) {
      throw new Error("Failed to create SoundCloud playlist")
    }

    return response.json()
  }

  // Conversion method - this will call your backend
  async convertPlaylist(spotifyToken: string, soundcloudToken: string, playlistId: string) {
    const response = await fetch(`${this.baseUrl}/api/convert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        spotifyToken,
        soundcloudToken,
        playlistId,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to convert playlist")
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()
