"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./auth-provider"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { Loader2, Music, Users } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface Playlist {
  id: string
  name: string
  description: string
  tracks: { total: number }
  images: Array<{ url: string }>
  owner: { display_name: string }
  public: boolean
  collaborative: boolean
}

interface PlaylistSelectorProps {
  onPlaylistSelect: (playlist: Playlist) => void
  selectedPlaylist: Playlist | null
}

export function PlaylistSelector({ onPlaylistSelect, selectedPlaylist }: PlaylistSelectorProps) {
  const { spotifyToken } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (spotifyToken) {
      fetchPlaylists()
    }
  }, [spotifyToken])

  const fetchPlaylists = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiClient.getSpotifyPlaylists(spotifyToken!)
      setPlaylists(data.items || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading your playlists...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">Error loading playlists: {error}</p>
        <Button onClick={fetchPlaylists} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (playlists.length === 0) {
    return (
      <div className="text-center py-8">
        <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No playlists found in your Spotify account.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Found {playlists.length} playlist{playlists.length !== 1 ? "s" : ""} in your Spotify account.
      </p>

      <div className="grid gap-3 max-h-96 overflow-y-auto">
        {playlists.map((playlist) => (
          <Card
            key={playlist.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedPlaylist?.id === playlist.id ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
            }`}
            onClick={() => onPlaylistSelect(playlist)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Playlist Image */}
                <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                  {playlist.images?.[0]?.url ? (
                    <img
                      src={playlist.images[0].url || "/placeholder.svg"}
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Playlist Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm truncate">{playlist.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">by {playlist.owner.display_name}</p>
                      {playlist.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{playlist.description}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {playlist.tracks.total} tracks
                      </Badge>
                      {playlist.collaborative && (
                        <Badge variant="outline" className="text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          Collaborative
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPlaylist && (
        <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm font-medium text-primary">Selected: {selectedPlaylist.name}</p>
          <p className="text-xs text-muted-foreground">{selectedPlaylist.tracks.total} tracks • Ready to convert</p>
        </div>
      )}
    </div>
  )
}
