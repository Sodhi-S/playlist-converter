"use client"

import { useAuth } from "./auth-provider"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { CheckCircle, Music, Radio } from "lucide-react"

export function AuthSection() {
  const {
    isSpotifyConnected,
    isSoundCloudConnected,
    connectSpotify,
    connectSoundCloud,
    disconnectSpotify,
    disconnectSoundCloud,
  } = useAuth()

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Spotify Connection */}
      <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 bg-[#1DB954] rounded-full mx-auto">
            <Music className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Spotify</h3>
            <p className="text-sm text-muted-foreground">Connect to access your playlists</p>
          </div>
          {isSpotifyConnected ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-primary">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Connected</span>
              </div>
              <Button variant="outline" size="sm" onClick={disconnectSpotify}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={connectSpotify} className="bg-[#1DB954] hover:bg-[#1ed760] text-white">
              Connect Spotify
            </Button>
          )}
        </CardContent>
      </Card>

      {/* SoundCloud Connection */}
      <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 bg-[#FF5500] rounded-full mx-auto">
            <Radio className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">SoundCloud</h3>
            <p className="text-sm text-muted-foreground">Connect to create new playlists</p>
          </div>
          {isSoundCloudConnected ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-primary">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Connected</span>
              </div>
              <Button variant="outline" size="sm" onClick={disconnectSoundCloud}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={connectSoundCloud} className="bg-[#FF5500] hover:bg-[#ff6600] text-white">
              Connect SoundCloud
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
