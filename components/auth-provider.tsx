"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AuthState {
  spotifyToken: string | null
  soundcloudToken: string | null
  isSpotifyConnected: boolean
  isSoundCloudConnected: boolean
}

interface AuthContextType extends AuthState {
  connectSpotify: () => void
  connectSoundCloud: () => void
  disconnectSpotify: () => void
  disconnectSoundCloud: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    spotifyToken: null,
    soundcloudToken: null,
    isSpotifyConnected: false,
    isSoundCloudConnected: false,
  })

  useEffect(() => {
    const spotifyToken = localStorage.getItem("spotify_token")
    const soundcloudToken = localStorage.getItem("soundcloud_token")

    setAuthState({
      spotifyToken,
      soundcloudToken,
      isSpotifyConnected: !!spotifyToken,
      isSoundCloudConnected: !!soundcloudToken,
    })

    const urlParams = new URLSearchParams(window.location.search)
    const spotifyTokenFromUrl = urlParams.get("spotify_token")
    const soundcloudTokenFromUrl = urlParams.get("soundcloud_token")

    if (spotifyTokenFromUrl) {
      localStorage.setItem("spotify_token", spotifyTokenFromUrl)
      setAuthState((prev) => ({
        ...prev,
        spotifyToken: spotifyTokenFromUrl,
        isSpotifyConnected: true,
      }))
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    if (soundcloudTokenFromUrl) {
      localStorage.setItem("soundcloud_token", soundcloudTokenFromUrl)
      setAuthState((prev) => ({
        ...prev,
        soundcloudToken: soundcloudTokenFromUrl,
        isSoundCloudConnected: true,
      }))
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const connectSpotify = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    window.location.href = `${backendUrl}/auth/spotify`
  }

  const connectSoundCloud = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    window.location.href = `${backendUrl}/auth/soundcloud`
  }

  const disconnectSpotify = () => {
    localStorage.removeItem("spotify_token")
    setAuthState((prev) => ({
      ...prev,
      spotifyToken: null,
      isSpotifyConnected: false,
    }))
  }

  const disconnectSoundCloud = () => {
    localStorage.removeItem("soundcloud_token")
    setAuthState((prev) => ({
      ...prev,
      soundcloudToken: null,
      isSoundCloudConnected: false,
    }))
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        connectSpotify,
        connectSoundCloud,
        disconnectSpotify,
        disconnectSoundCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
