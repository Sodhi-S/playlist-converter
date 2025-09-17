import { API_CONFIG } from "./api-config"

export interface SpotifyTrack {
  id: string
  name: string
  artists: string[]
  duration_ms: number
  external_urls: {
    spotify: string
  }
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  tracks: {
    total: number
  }
  images: Array<{ url: string }>
  owner: {
    display_name: string
  }
  public: boolean
  collaborative: boolean
}

export class SpotifyService {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  async getPlaylists(): Promise<SpotifyPlaylist[]> {
    const response = await fetch(API_CONFIG.SPOTIFY.PLAYLISTS, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch Spotify playlists")
    }

    const data = await response.json()
    return data.items || []
  }

  async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    const response = await fetch(`${API_CONFIG.SPOTIFY.PLAYLIST_DETAILS}/${playlistId}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch playlist tracks")
    }

    const data = await response.json()
    return data.tracks || []
  }

  async getPlaylistsDirectly(): Promise<SpotifyPlaylist[]> {
    const response = await fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch Spotify playlists")
    }

    const data = await response.json()
    return data.items || []
  }

  async getPlaylistTracksDirectly(playlistId: string): Promise<SpotifyTrack[]> {
    const [playlistResponse, tracksResponse] = await Promise.all([
      fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      }),
      fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`, {
        headers: { Authorization: `Bearer ${this.token}` },
      }),
    ])

    if (!playlistResponse.ok || !tracksResponse.ok) {
      throw new Error("Failed to fetch playlist data")
    }

    const tracks = await tracksResponse.json()
    return tracks.items.map((item: any) => ({
      id: item.track.id,
      name: item.track.name,
      artists: item.track.artists.map((artist: any) => artist.name),
      duration_ms: item.track.duration_ms,
      external_urls: item.track.external_urls,
    }))
  }
}

export function createSpotifyService(token: string): SpotifyService {
  return new SpotifyService(token)
}
