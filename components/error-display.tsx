"use client"

import { AlertCircle, RefreshCw, Wifi, ExternalLink, Bug } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Alert, AlertDescription } from "./ui/alert"
import { PlaylistConverterError, getErrorRecoveryActions } from "@/lib/error-handler"

interface ErrorDisplayProps {
  error: PlaylistConverterError | Error
  onRetry?: () => void
  onReconnect?: (service?: string) => void
  compact?: boolean
}

export function ErrorDisplay({ error, onRetry, onReconnect, compact = false }: ErrorDisplayProps) {
  const isPlaylistError = error instanceof PlaylistConverterError
  const recoveryActions = isPlaylistError ? getErrorRecoveryActions(error) : []

  const handleAction = (action: string) => {
    switch (action) {
      case "retry":
        onRetry?.()
        break
      case "reconnect":
        onReconnect?.()
        break
      case "check_network":
        // Open network troubleshooting
        window.open("https://www.google.com", "_blank")
        break
      case "report":
        // Open GitHub issues or support
        window.open("https://github.com/your-repo/issues", "_blank")
        break
    }
  }

  const getErrorIcon = () => {
    if (!isPlaylistError) return <AlertCircle className="w-5 h-5 text-destructive" />

    switch (error.code) {
      case "NETWORK_ERROR":
        return <Wifi className="w-5 h-5 text-destructive" />
      case "AUTH_ERROR":
        return <AlertCircle className="w-5 h-5 text-destructive" />
      default:
        return <AlertCircle className="w-5 h-5 text-destructive" />
    }
  }

  if (compact) {
    return (
      <Alert variant="destructive">
        {getErrorIcon()}
        <AlertDescription className="flex items-center justify-between">
          <span>{error.message}</span>
          {recoveryActions.length > 0 && (
            <div className="flex gap-2 ml-4">
              {recoveryActions.slice(0, 1).map((action) => (
                <Button
                  key={action.action}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction(action.action)}
                  className="bg-transparent"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          {getErrorIcon()}
          <CardTitle className="text-destructive">
            {isPlaylistError && error.code === "AUTH_ERROR"
              ? "Authentication Required"
              : isPlaylistError && error.code === "NETWORK_ERROR"
                ? "Connection Problem"
                : "Error Occurred"}
          </CardTitle>
        </div>
        <CardDescription>{error.message}</CardDescription>
      </CardHeader>
      {recoveryActions.length > 0 && (
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {recoveryActions.map((action) => (
              <Button
                key={action.action}
                variant={action.primary ? "default" : "outline"}
                size="sm"
                onClick={() => handleAction(action.action)}
                className={action.action === "retry" ? "bg-primary" : ""}
              >
                {action.action === "retry" && <RefreshCw className="w-4 h-4 mr-2" />}
                {action.action === "report" && <Bug className="w-4 h-4 mr-2" />}
                {action.action === "check_network" && <ExternalLink className="w-4 h-4 mr-2" />}
                {action.label}
              </Button>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
