"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Trash2, Music } from "lucide-react"
import { ProgressTracker } from "@/components/progress-tracker"

type Step = {
  title: string
  description: string
  status: "pending" | "loading" | "completed"
}

async function fetchFacebookYouTubeVideos(accessToken: string) {
  // Implement Facebook API call to fetch feed and filter YouTube videos
  await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulated delay
  return [
    { id: "1", title: "Video 1" },
    { id: "2", title: "Video 2" },
    { id: "3", title: "Video 3" },
  ]
}

async function searchSpotifySongs(accessToken: string, videoTitles: string[]) {
  // Implement Spotify API call to search for songs
  await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulated delay
  return videoTitles.map((title) => ({ id: title, name: title, artist: "Unknown" }))
}

async function createSpotifyPlaylist(accessToken: string, playlistName: string, trackUris: string[]) {
  // Implement Spotify API call to create a playlist
  await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulated delay
  return { id: "new-playlist-id", name: playlistName }
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null)
  const [spotifySongs, setSpotifySongs] = useState<any[]>([])
  const [playlistName, setPlaylistName] = useState("")
  const [currentProgress, setCurrentProgress] = useState(25)

  const steps: Step[] = [
    {
      title: "Connect Facebook",
      description: "Sign in with your Facebook account",
      status: "completed",
    },
    {
      title: "Connect Spotify",
      description: "Link your Spotify account",
      status: spotifyToken ? "completed" : "pending",
    },
    {
      title: "Fetch Videos",
      description: "Getting your shared YouTube videos from Facebook",
      status: "pending",
    },
    {
      title: "Create Playlist",
      description: "Finding songs on Spotify and creating your playlist",
      status: "pending",
    },
  ]

  const [currentSteps, setCurrentSteps] = useState(steps)

  useEffect(() => {
    if (spotifyToken) {
      setCurrentProgress(50)
      setCurrentSteps((prev) => {
        const newSteps = [...prev]
        newSteps[1].status = "completed"
        return newSteps
      })
    }
  }, [spotifyToken])

  const { data: youtubeVideos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ["youtubeVideos"],
    queryFn: () => {
      setCurrentSteps((prev) => {
        const newSteps = [...prev]
        newSteps[2].status = "loading"
        return newSteps
      })
      return fetchFacebookYouTubeVideos(session?.accessToken as string)
    },
    onSuccess: () => {
      setCurrentSteps((prev) => {
        const newSteps = [...prev]
        newSteps[2].status = "completed"
        return newSteps
      })
      setCurrentProgress(75)
    },
    enabled: !!session?.accessToken && !!spotifyToken,
  })

  const { mutate: searchSongs, isLoading: isSearchingSongs } = useMutation({
    mutationFn: (videoTitles: string[]) => searchSpotifySongs(spotifyToken as string, videoTitles),
    onSuccess: (data) => setSpotifySongs(data),
  })

  const { mutate: createPlaylist, isLoading: isCreatingPlaylist } = useMutation({
    mutationFn: (name: string) => {
      setCurrentSteps((prev) => {
        const newSteps = [...prev]
        newSteps[3].status = "loading"
        return newSteps
      })
      return createSpotifyPlaylist(
        spotifyToken as string,
        name,
        spotifySongs.map((song) => song.id),
      )
    },
    onSuccess: (data) => {
      setCurrentSteps((prev) => {
        const newSteps = [...prev]
        newSteps[3].status = "completed"
        return newSteps
      })
      setCurrentProgress(100)
      alert(`Playlist "${data.name}" created successfully!`)
      setSpotifySongs([])
      setPlaylistName("")
    },
  })

  const handleRemoveSong = (id: string) => {
    setSpotifySongs((songs) => songs.filter((song) => song.id !== id))
  }

  const handleSpotifyConnect = () => {
    // Implement Spotify connection logic here
    // For now, we'll just simulate it
    setTimeout(() => {
      setSpotifyToken("fake-spotify-token")
    }, 1000)
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex justify-center items-center h-screen">
        <Button onClick={() => signIn("facebook")}>Sign in with Facebook</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 min-h-screen text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

        <ProgressTracker steps={currentSteps} currentProgress={currentProgress} />

        {!spotifyToken && (
          <div className="text-center">
            <p className="mb-4">Connect your Spotify account to continue</p>
            <Button onClick={handleSpotifyConnect}>Connect Spotify</Button>
          </div>
        )}

        {spotifyToken && youtubeVideos && youtubeVideos.length > 0 && (
          <Button
            onClick={() => searchSongs(youtubeVideos.map((video) => video.title))}
            disabled={isSearchingSongs}
            className="mb-4"
          >
            {isSearchingSongs ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching Songs
              </>
            ) : (
              "Search Spotify Songs"
            )}
          </Button>
        )}

        {spotifySongs.length > 0 && (
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">Spotify Songs</h2>
            <ul className="space-y-2">
              {spotifySongs.map((song) => (
                <li key={song.id} className="flex items-center justify-between bg-white bg-opacity-20 p-2 rounded">
                  <span>
                    {song.name} - {song.artist}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveSong(song.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {spotifySongs.length > 0 && (
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Enter playlist name"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={() => createPlaylist(playlistName)} disabled={isCreatingPlaylist || !playlistName}>
              {isCreatingPlaylist ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Playlist
                </>
              ) : (
                <>
                  <Music className="mr-2 h-4 w-4" /> Create Playlist
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
