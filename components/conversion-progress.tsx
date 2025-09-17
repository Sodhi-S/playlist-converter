"use client"

import { useState } from "react"
import { useAuth } from "./auth-provider"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
import { Play, Loader2 } from "lucide-react"
import { createPlaylistConverter, type ConversionResult } from "@/components/playlist-converter"
import { ErrorDisplay } from "./error-display"
import { MatchResultsDetailed } from "./match-results-detailed"
import { PlaylistConverterError, handleApiError } from "@/lib/error-handler"

interface ConversionProgressProps {
  playlist: any
  onConversionComplete: () => void
  isConverting: boolean
  setIsConverting: (converting: boolean) => void
}

export function ConversionProgress({
  playlist,
  onConversionComplete,
  isConverting,
  setIsConverting,
}: ConversionProgressProps) {
  const { spotifyToken, soundcloudToken, connectSpotify, connectSoundCloud } = useAuth()
  const [progress, setProgress] = useState(0)
  const [currentTrack, setCurrentTrack] = useState<string>("")
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null)
  const [error, setError] = useState<PlaylistConverterError | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const startConversion = async () => {
    if (!spotifyToken || !soundcloudToken) {
      setError(new PlaylistConverterError("Both Spotify and SoundCloud tokens are required", "AUTH_ERROR"))
      return
    }

    setIsConverting(true)
    setError(null)
    setProgress(0)
    setCurrentTrack("")
    setConversionResult(null)

    try {
      const converter = createPlaylistConverter(spotifyToken, soundcloudToken)

      const result = await converter.convertPlaylist(playlist.id, (progressPercent, trackName) => {
        setProgress(progressPercent)
        if (trackName) {
          setCurrentTrack(trackName)
        }
      })

      setConversionResult(result)
      onConversionComplete()
      setRetryCount(0) // Reset retry count on success
    } catch (err) {
      const handledError = handleApiError(err, "Conversion")
      setError(handledError)
      setRetryCount((prev) => prev + 1)
    } finally {
      setIsConverting(false)
      setCurrentTrack("")
    }
  }

  const handleRetry = () => {
    if (retryCount >= 3) {
      setError(
        new PlaylistConverterError(
          "Maximum retry attempts reached. Please check your connection and try again later.",
          "MAX_RETRIES",
          false,
        ),
      )
      return
    }
    startConversion()
  }

  const handleReconnect = (service?: string) => {
    if (service === "spotify" || !soundcloudToken) {
      connectSpotify()
    } else {
      connectSoundCloud()
    }
  }

  const handleExportResults = () => {
    if (!conversionResult) return

    const exportData = {
      originalPlaylist: conversionResult.originalPlaylist,
      conversionDate: new Date().toISOString(),
      successRate: (conversionResult.successCount / conversionResult.matches.length) * 100,
      matches: conversionResult.matches.map((match) => ({
        originalTrack: `${match.spotifyTrack.name} by ${match.spotifyTrack.artists.join(", ")}`,
        matchedTrack: match.soundcloudTrack
          ? `${match.soundcloudTrack.title} by ${match.soundcloudTrack.user.username}`
          : null,
        matchScore: match.matchScore,
        status: match.status,
      })),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `playlist-conversion-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (conversionResult) {
    return (
      <MatchResultsDetailed
        result={conversionResult}
        onExportResults={handleExportResults}
        onShareResults={() => {
          if (navigator.share && conversionResult.createdPlaylist) {
            navigator.share({
              title: "Check out my converted playlist!",
              text: `I converted my Spotify playlist to SoundCloud with ${Math.round((conversionResult.successCount / conversionResult.matches.length) * 100)}% success rate`,
              url: conversionResult.createdPlaylist.url,
            })
          }
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Playlist Info */}
      <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="w-16 h-16 bg-primary/10 rounded-lg flex-shrink-0 overflow-hidden">
          {playlist.images?.[0]?.url ? (
            <img
              src={playlist.images[0].url || "/placeholder.svg"}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-6 h-6 text-primary" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{playlist.name}</h3>
          <p className="text-sm text-muted-foreground">
            {playlist.tracks.total} tracks • by {playlist.owner.display_name}
          </p>
          {playlist.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{playlist.description}</p>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && <ErrorDisplay error={error} onRetry={handleRetry} onReconnect={handleReconnect} />}

      {/* Conversion Controls */}
      {!isConverting && !error ? (
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Ready to convert this playlist to SoundCloud. We'll search for matching tracks and create a new playlist for
            you.
          </p>
          {retryCount > 0 && (
            <p className="text-sm text-muted-foreground">Previous attempt failed. Retry attempt {retryCount}/3</p>
          )}
          <Button onClick={startConversion} size="lg" className="px-8" disabled={retryCount >= 3}>
            {retryCount > 0 ? "Retry Conversion" : "Start Conversion"}
          </Button>
        </div>
      ) : isConverting ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Converting playlist...</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {currentTrack && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="truncate">Searching for: {currentTrack}</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
