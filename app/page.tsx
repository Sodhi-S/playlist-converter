import { AuthProvider } from "@/components/auth-provider"
import { PlaylistConverter } from "@/components/playlist-converter"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <PlaylistConverter />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}
