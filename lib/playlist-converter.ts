import { type SpotifyTrack, createSpotifyService } from "./spotify"
import { type SoundCloudTrack, createSoundCloudService } from "./soundcloud"

export interface ConversionMatch {
  spotifyTrack: SpotifyTrack
  soundcloudTrack: SoundCloudTrack | null
  matchScore: number
  status: "matched" | "not_found" | "error"
  errorMessage?: string
}

export interface ConversionResult {
  originalPlaylist: {
    name: string
    description: string
    trackCount: number
  }
  matches: ConversionMatch[]
  successCount: number
  failureCount: number
  createdPlaylist?: {
    id: string
    url: string
    title: string
  }
}

export class PlaylistConverter {
  private spotifyService: any
  private soundcloudService: any

  constructor(spotifyToken: string, soundcloudToken: string) {
    this.spotifyService = createSpotifyService(spotifyToken)
    this.soundcloudService = createSoundCloudService(soundcloudToken)
  }

  /**
   * Convert a Spotify playlist to SoundCloud
   */
  async convertPlaylist(
    spotifyPlaylistId: string,
    onProgress?: (progress: number, currentTrack?: string) => void,
  ): Promise<ConversionResult> {
    try {
      // Get Spotify playlist tracks
      const spotifyTracks = await this.spotifyService.getPlaylistTracks(spotifyPlaylistId)

      if (spotifyTracks.length === 0) {
        throw new Error("No tracks found in the Spotify playlist")
      }

      const matches: ConversionMatch[] = []
      let processedCount = 0

      // Process each track
      for (const spotifyTrack of spotifyTracks) {
        try {
          onProgress?.(
            (processedCount / spotifyTracks.length) * 80, // Reserve 20% for playlist creation
            `${spotifyTrack.name} by ${spotifyTrack.artists.join(", ")}`,
          )

          const soundcloudTrack = await this.findBestMatch(spotifyTrack)
          const matchScore = soundcloudTrack ? this.calculateMatchScore(spotifyTrack, soundcloudTrack) : 0

          matches.push({
            spotifyTrack,
            soundcloudTrack,
            matchScore,
            status: soundcloudTrack ? "matched" : "not_found",
          })
        } catch (error) {
          matches.push({
            spotifyTrack,
            soundcloudTrack: null,
            matchScore: 0,
            status: "error",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          })
        }

        processedCount++
      }

      const successfulMatches = matches.filter((match) => match.soundcloudTrack)
      const successCount = successfulMatches.length
      const failureCount = matches.length - successCount

      // Create SoundCloud playlist with matched tracks
      let createdPlaylist
      if (successfulMatches.length > 0) {
        onProgress?.(90, "Creating SoundCloud playlist...")

        const playlistTitle = `${spotifyTracks[0] ? "Converted from Spotify" : "Spotify Playlist"}`
        const playlistDescription = `Converted from Spotify playlist with ${successCount}/${matches.length} tracks matched`

        try {
          createdPlaylist = await this.soundcloudService.createPlaylist(
            playlistTitle,
            playlistDescription,
            successfulMatches.map((match) => match.soundcloudTrack!),
          )
        } catch (error) {
          console.error("Failed to create SoundCloud playlist:", error)
          // Continue without failing the entire conversion
        }
      }

      onProgress?.(100, "Conversion complete!")

      return {
        originalPlaylist: {
          name: "Spotify Playlist", // This would come from the actual playlist data
          description: "",
          trackCount: spotifyTracks.length,
        },
        matches,
        successCount,
        failureCount,
        createdPlaylist: createdPlaylist
          ? {
              id: createdPlaylist.id,
              url: createdPlaylist.permalink_url,
              title: createdPlaylist.title,
            }
          : undefined,
      }
    } catch (error) {
      throw new Error(`Conversion failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Find the best matching SoundCloud track for a Spotify track
   */
  private async findBestMatch(spotifyTrack: SpotifyTrack): Promise<SoundCloudTrack | null> {
    const searchQueries = this.generateSearchQueries(spotifyTrack)

    for (const query of searchQueries) {
      try {
        const results = await this.soundcloudService.searchTracks(query)

        if (results.length > 0) {
          // Find the best match from results
          const bestMatch = this.selectBestMatch(spotifyTrack, results)
          if (bestMatch) {
            return bestMatch
          }
        }
      } catch (error) {
        console.warn(`Search failed for query "${query}":`, error)
        continue
      }
    }

    return null
  }

  /**
   * Generate multiple search queries for better matching
   */
  private generateSearchQueries(track: SpotifyTrack): string[] {
    const artist = track.artists[0] || ""
    const title = track.name

    // Clean up track name (remove features, remixes, etc.)
    const cleanTitle = title
      .replace(/$$feat\..*?$$/gi, "")
      .replace(/$$ft\..*?$$/gi, "")
      .replace(/$$featuring.*?$$/gi, "")
      .replace(/$$remix$$/gi, "")
      .replace(/$$.*?remix.*?$$/gi, "")
      .replace(/$$.*?version.*?$$/gi, "")
      .trim()

    return [
      `${artist} ${title}`, // Full original
      `${artist} ${cleanTitle}`, // Cleaned version
      `${title} ${artist}`, // Reversed order
      `${cleanTitle}`, // Title only
      `${artist}`, // Artist only (as fallback)
    ].filter(Boolean)
  }

  /**
   * Select the best match from search results
   */
  private selectBestMatch(spotifyTrack: SpotifyTrack, candidates: SoundCloudTrack[]): SoundCloudTrack | null {
    if (candidates.length === 0) return null

    let bestMatch = candidates[0]
    let bestScore = this.calculateMatchScore(spotifyTrack, candidates[0])

    for (let i = 1; i < candidates.length; i++) {
      const score = this.calculateMatchScore(spotifyTrack, candidates[i])
      if (score > bestScore) {
        bestScore = score
        bestMatch = candidates[i]
      }
    }

    // Only return matches with a reasonable score
    return bestScore > 0.3 ? bestMatch : null
  }

  /**
   * Calculate match score between Spotify and SoundCloud tracks
   */
  private calculateMatchScore(spotifyTrack: SpotifyTrack, soundcloudTrack: SoundCloudTrack): number {
    const spotifyTitle = this.normalizeString(spotifyTrack.name)
    const spotifyArtist = this.normalizeString(spotifyTrack.artists[0] || "")

    const soundcloudTitle = this.normalizeString(soundcloudTrack.title)
    const soundcloudArtist = this.normalizeString(soundcloudTrack.user.username)

    // Calculate title similarity
    const titleScore = this.calculateStringSimilarity(spotifyTitle, soundcloudTitle)

    // Calculate artist similarity
    const artistScore = this.calculateStringSimilarity(spotifyArtist, soundcloudArtist)

    // Check if artist name appears in SoundCloud title (common pattern)
    const artistInTitle = soundcloudTitle.includes(spotifyArtist) ? 0.3 : 0

    // Check if title appears in SoundCloud title
    const titleInSoundcloud = soundcloudTitle.includes(spotifyTitle) ? 0.4 : 0

    // Duration similarity (if available)
    const durationScore =
      soundcloudTrack.duration && spotifyTrack.duration_ms
        ? this.calculateDurationSimilarity(spotifyTrack.duration_ms, soundcloudTrack.duration)
        : 0

    // Weighted combination
    return titleScore * 0.4 + artistScore * 0.3 + artistInTitle * 0.1 + titleInSoundcloud * 0.1 + durationScore * 0.1
  }

  /**
   * Normalize string for comparison
   */
  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^\w\s]/g, "") // Remove special characters
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim()
  }

  /**
   * Calculate string similarity using simple algorithm
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1
    if (str1.length === 0 || str2.length === 0) return 0

    // Simple substring matching
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.includes(shorter)) {
      return shorter.length / longer.length
    }

    // Word-based matching
    const words1 = str1.split(" ")
    const words2 = str2.split(" ")
    const commonWords = words1.filter((word) => words2.includes(word))

    return commonWords.length / Math.max(words1.length, words2.length)
  }

  /**
   * Calculate duration similarity
   */
  private calculateDurationSimilarity(spotifyDurationMs: number, soundcloudDurationMs: number): number {
    const diff = Math.abs(spotifyDurationMs - soundcloudDurationMs)
    const maxDuration = Math.max(spotifyDurationMs, soundcloudDurationMs)

    // If within 10 seconds, consider it a good match
    if (diff <= 10000) return 1

    // Linear decay for larger differences
    return Math.max(0, 1 - diff / maxDuration)
  }
}

export function createPlaylistConverter(spotifyToken: string, soundcloudToken: string): PlaylistConverter {
  return new PlaylistConverter(spotifyToken, soundcloudToken)
}
