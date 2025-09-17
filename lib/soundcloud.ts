import { API_CONFIG } from "./api-config"

export interface SoundCloudTrack {
  id: number
  title: string
  user: {
    username: string
  }
  duration: number
  permalink_url: string
  artwork_url?: string
  stream_url?: string
}

export interface SoundCloudSearchResult {
  collection: SoundCloudTrack[]
  next_href?: string
}

export class SoundCloudService {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  async searchTracks(query: string): Promise<SoundCloudTrack[]> {
    const response = await fetch(`${API_CONFIG.SOUNDCLOUD.SEARCH}?q=${encodeURIComponent(query)}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to search SoundCloud tracks")
    }

    const data = await response.json()
    return data.collection || data
  }

  async createPlaylist(title: string, description: string, tracks: SoundCloudTrack[]): Promise<any> {
    const response = await fetch(API_CONFIG.SOUNDCLOUD.PLAYLISTS, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        tracks,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create playlist")
    }

    return response.json()
  }

  async getUserInfo(): Promise<any> {
    const response = await fetch(API_CONFIG.SOUNDCLOUD.USER, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to get user info")
    }

    return response.json()
  }

  async searchTracksDirectly(query: string): Promise<SoundCloudTrack[]> {
    const clientId = process.env.NEXT_PUBLIC_SOUNDCLOUD_CLIENT_ID
    const response = await fetch(
      `https://api.soundcloud.com/tracks?q=${encodeURIComponent(query)}&limit=5&client_id=${clientId}&oauth_token=${this.token}`,
      {
        headers: {
          Authorization: `OAuth ${this.token}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error("Failed to search SoundCloud tracks")
    }

    const data = await response.json()
    return Array.isArray(data) ? data : data.collection || []
  }

  async createPlaylistDirectly(title: string, description: string, tracks: SoundCloudTrack[]): Promise<any> {
    const response = await fetch("https://api.soundcloud.com/playlists", {
      method: "POST",
      headers: {
        Authorization: `OAuth ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playlist: {
          title,
          description,
          sharing: "public",
          tracks: tracks.map((track) => ({ id: track.id })),
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.errors?.[0]?.error_message || "Failed to create playlist")
    }

    return response.json()
  }

  async getUserInfoDirectly(): Promise<any> {
    const response = await fetch(`https://api.soundcloud.com/me?oauth_token=${this.token}`, {
      headers: {
        Authorization: `OAuth ${this.token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to get user info")
    }

    return response.json()
  }
}

export function createSoundCloudService(token: string): SoundCloudService {
  return new SoundCloudService(token)
}
