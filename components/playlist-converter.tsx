"use client"

import { useState } from "react"
import { useAuth } from "./auth-provider"
import { AuthSection } from "./auth-section"
import { PlaylistSelector } from "./playlist-selector"
import { ConversionProgress } from "./conversion-progress"
import { ErrorBoundary } from "./error-boundary"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { ArrowRight, CheckCircle, Info } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"

export function PlaylistConverter() {
  const { isSpotifyConnected, isSoundCloudConnected } = useAuth()
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [conversionComplete, setConversionComplete] = useState(false)

  const canProceed = isSpotifyConnected && isSoundCloudConnected

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-balance">Convert Your Spotify Playlists to SoundCloud</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Seamlessly transfer your favorite playlists between platforms. Connect your accounts and let us handle the
            rest.
          </p>
        </div>

        {/* Important Notice */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This app requires API access to both Spotify and SoundCloud. Make sure you have the necessary API keys
            configured. Track matching is done using intelligent algorithms but may not be 100% accurate.
          </AlertDescription>
        </Alert>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 py-8">
          <div className={`flex items-center gap-2 ${canProceed ? "text-primary" : "text-muted-foreground"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${canProceed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {canProceed ? <CheckCircle className="w-5 h-5" /> : "1"}
            </div>
            <span className="font-medium">Connect Accounts</span>
          </div>

          <ArrowRight className="w-5 h-5 text-muted-foreground" />

          <div className={`flex items-center gap-2 ${selectedPlaylist ? "text-primary" : "text-muted-foreground"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedPlaylist ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {selectedPlaylist ? <CheckCircle className="w-5 h-5" /> : "2"}
            </div>
            <span className="font-medium">Select Playlist</span>
          </div>

          <ArrowRight className="w-5 h-5 text-muted-foreground" />

          <div className={`flex items-center gap-2 ${conversionComplete ? "text-primary" : "text-muted-foreground"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${conversionComplete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {conversionComplete ? <CheckCircle className="w-5 h-5" /> : "3"}
            </div>
            <span className="font-medium">Convert</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6">
          {/* Authentication Section */}
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Connect Your Accounts</CardTitle>
              <CardDescription>
                Authorize access to your Spotify and SoundCloud accounts to enable playlist conversion.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthSection />
            </CardContent>
          </Card>

          {/* Playlist Selection */}
          {canProceed && (
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Select Playlist to Convert</CardTitle>
                <CardDescription>Choose which Spotify playlist you'd like to convert to SoundCloud.</CardDescription>
              </CardHeader>
              <CardContent>
                <PlaylistSelector onPlaylistSelect={setSelectedPlaylist} selectedPlaylist={selectedPlaylist} />
              </CardContent>
            </Card>
          )}

          {/* Conversion Progress */}
          {selectedPlaylist && (
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Convert Playlist</CardTitle>
                <CardDescription>
                  We'll search for matching tracks on SoundCloud and create your new playlist.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConversionProgress
                  playlist={selectedPlaylist}
                  onConversionComplete={() => setConversionComplete(true)}
                  isConverting={isConverting}
                  setIsConverting={setIsConverting}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}
