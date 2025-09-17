import { Github, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              Built with <Heart className="inline w-4 h-4 text-red-500 mx-1" />
              for music lovers
            </p>
            <p className="text-xs text-muted-foreground mt-1">Convert your playlists seamlessly between platforms</p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
              View on GitHub
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              This app requires API keys from Spotify and SoundCloud. Make sure to set up your environment variables:
            </p>
            <div className="mt-2 text-xs text-muted-foreground font-mono bg-muted/50 rounded p-2 inline-block">
              NEXT_PUBLIC_SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, NEXT_PUBLIC_SOUNDCLOUD_CLIENT_ID,
              SOUNDCLOUD_CLIENT_SECRET
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
