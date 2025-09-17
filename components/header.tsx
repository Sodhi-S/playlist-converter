import { Music } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Music className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">PlaylistBridge</h1>
              <p className="text-sm text-muted-foreground">Convert Spotify playlists to SoundCloud</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
