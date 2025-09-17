"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Play,
  Clock,
  TrendingUp,
  Filter,
  Download,
  Share2,
} from "lucide-react"
import type { ConversionResult, ConversionMatch } from "@/components/playlist-converter"

interface MatchResultsDetailedProps {
  result: ConversionResult
  onExportResults?: () => void
  onShareResults?: () => void
}

export function MatchResultsDetailed({ result, onExportResults, onShareResults }: MatchResultsDetailedProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [filterStatus, setFilterStatus] = useState<"all" | "matched" | "not_found" | "error">("all")

  const filteredMatches = result.matches.filter((match) => {
    if (filterStatus === "all") return true
    return match.status === filterStatus
  })

  const getMatchQualityDistribution = () => {
    const matched = result.matches.filter((m) => m.status === "matched")
    const excellent = matched.filter((m) => m.matchScore >= 0.8).length
    const good = matched.filter((m) => m.matchScore >= 0.6 && m.matchScore < 0.8).length
    const fair = matched.filter((m) => m.matchScore >= 0.4 && m.matchScore < 0.6).length
    const poor = matched.filter((m) => m.matchScore < 0.4).length

    return { excellent, good, fair, poor }
  }

  const qualityDistribution = getMatchQualityDistribution()
  const successRate = (result.successCount / result.matches.length) * 100

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Conversion Results</h2>
          <p className="text-muted-foreground">
            {result.successCount} of {result.matches.length} tracks successfully matched
          </p>
        </div>
        <div className="flex gap-2">
          {onShareResults && (
            <Button variant="outline" size="sm" onClick={onShareResults}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}
          {onExportResults && (
            <Button variant="outline" size="sm" onClick={onExportResults}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matches">Track Matches</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Success Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Conversion Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Success</span>
                  <span className="text-2xl font-bold text-primary">{Math.round(successRate)}%</span>
                </div>
                <Progress value={successRate} className="h-3" />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{result.successCount}</div>
                    <div className="text-xs text-muted-foreground">Found</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-destructive">{result.failureCount}</div>
                    <div className="text-xs text-muted-foreground">Not Found</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{result.matches.length}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Match Quality */}
          <Card>
            <CardHeader>
              <CardTitle>Match Quality Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Excellent (80%+)</span>
                  <Badge variant="default">{qualityDistribution.excellent}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Good (60-79%)</span>
                  <Badge variant="secondary">{qualityDistribution.good}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Fair (40-59%)</span>
                  <Badge variant="outline">{qualityDistribution.fair}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Poor (&lt;40%)</span>
                  <Badge variant="destructive">{qualityDistribution.poor}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Created Playlist */}
          {result.createdPlaylist && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-primary">✅ Playlist Created Successfully!</h3>
                    <p className="text-sm text-muted-foreground">{result.createdPlaylist.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {result.successCount} tracks added to your SoundCloud
                    </p>
                  </div>
                  <Button asChild>
                    <a href={result.createdPlaylist.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Playlist
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          {/* Filter Controls */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1">
              {(["all", "matched", "not_found", "error"] as const).map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status === "all" && "All"}
                  {status === "matched" && "Found"}
                  {status === "not_found" && "Not Found"}
                  {status === "error" && "Errors"}
                </Button>
              ))}
            </div>
          </div>

          {/* Track List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredMatches.map((match, index) => (
              <DetailedTrackMatch key={index} match={match} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">Avg. Match Score</div>
                  <div className="text-xl font-bold">
                    {Math.round(
                      (result.matches.filter((m) => m.status === "matched").reduce((sum, m) => sum + m.matchScore, 0) /
                        result.successCount) *
                        100,
                    )}
                    %
                  </div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Play className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">Conversion Rate</div>
                  <div className="text-xl font-bold">{Math.round(successRate)}%</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Common Issues</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Some tracks may not be available on SoundCloud</p>
                  <p>• Artist names might differ between platforms</p>
                  <p>• Remixes and alternate versions may not match exactly</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DetailedTrackMatch({ match }: { match: ConversionMatch }) {
  const getStatusIcon = () => {
    switch (match.status) {
      case "matched":
        return <CheckCircle className="w-5 h-5 text-primary" />
      case "not_found":
        return <XCircle className="w-5 h-5 text-destructive" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-destructive" />
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600"
    if (score >= 0.6) return "text-yellow-600"
    if (score >= 0.4) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {getStatusIcon()}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Original Track */}
            <div>
              <h4 className="font-medium text-sm truncate">{match.spotifyTrack.name}</h4>
              <p className="text-xs text-muted-foreground truncate">by {match.spotifyTrack.artists.join(", ")}</p>
            </div>

            {/* Match Info */}
            {match.soundcloudTrack && (
              <div className="p-2 bg-muted/50 rounded text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">✓ {match.soundcloudTrack.title}</p>
                    <p className="text-muted-foreground truncate">by {match.soundcloudTrack.user.username}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${getMatchScoreColor(match.matchScore)}`}>
                      {Math.round(match.matchScore * 100)}%
                    </span>
                    <Button asChild variant="ghost" size="sm">
                      <a href={match.soundcloudTrack.permalink_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {match.errorMessage && <p className="text-xs text-destructive">{match.errorMessage}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
