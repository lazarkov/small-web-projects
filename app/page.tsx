"use client"

import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Loader2,
  Music,
  LogIn,
  RefreshCw,
  CheckCircle,
  X,
  Share2,
  Facebook,
  AirplayIcon as Spotify,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Footer } from "@/components/footer"
import { SharePopup } from "@/components/share-popup"

type Step = {
  title: string
  description: string
  status: "pending" | "loading" | "completed"
}

type Video = {
  id: string
  title: string
  songFound?: boolean
}

type Song = {
  id: string
  name: string
  artist: string
}

const STORAGE_KEY_VIDEOS = "facebook_youtube_videos"
const STORAGE_KEY_SONGS = "spotify_songs"

// Memoized playlist item component that shows both video and song
const PlaylistItem = memo(
  ({
    video,
    song,
    onRemove,
  }: {
    video: Video
    song?: Song
    onRemove: (id: string) => void
  }) => {
    return (
      <li className="flex items-center justify-between bg-white bg-opacity-10 p-3 rounded-lg backdrop-blur-sm transition-all hover:bg-opacity-20">
        <div className="flex items-center w-full">
          <div className="flex-1">
            <p className="text-white font-medium">{video.title}</p>
          </div>

          {song ? (
            <div className="flex items-center ml-4 pl-4 border-l border-white border-opacity-20">
              <div className="flex-1">
                <p className="text-white font-medium">{song.name}</p>
                <p className="text-white text-opacity-70 text-sm">{song.artist}</p>
              </div>
              <CheckCircle className="h-4 w-4 text-green-400 ml-2 flex-shrink-0" />
            </div>
          ) : video.songFound === false ? (
            <div className="flex items-center ml-4 pl-4 border-l border-white border-opacity-20">
              <p className="text-white text-opacity-50 italic">No match found</p>
              <X className="h-4 w-4 text-red-400 ml-2 flex-shrink-0" />
            </div>
          ) : null}
        </div>
        <Button variant="ghost" size="sm" onClick={() => onRemove(video.id)} className="ml-2">
          <X className="h-4 w-4" />
        </Button>
      </li>
    )
  },
  (prevProps, nextProps) =>
    prevProps.video.id === nextProps.video.id &&
    prevProps.video.songFound === nextProps.video.songFound &&
    prevProps.song?.id === nextProps.song?.id,
)
PlaylistItem.displayName = "PlaylistItem"

async function fetchFacebookYouTubeVideos(accessToken: string): Promise<Video[]> {
  let allVideos: Video[] = []
  let nextPageUrl = `https://graph.facebook.com/v12.0/me/feed?fields=attachments{title,url}&limit=200`

  while (nextPageUrl) {
    const response = await fetch(nextPageUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    const data = await response.json()

    const youtubeVideos = data.data
      .filter(
        (post: any) =>
          post.attachments && post.attachments.data[0].url && post.attachments.data[0].url.includes("youtube.com"),
      )
      .map((post: any) => ({
        id: post.id,
        title: post.attachments.data[0].title,
      }))

    allVideos = [...allVideos, ...youtubeVideos]

    if (data.paging && data.paging.next) {
      nextPageUrl = data.paging.next
    } else {
      nextPageUrl = ""
    }
  }

  console.log("Total YouTube videos found:", allVideos.length)
  return allVideos
}

async function searchSpotifySongs(
  accessToken: string,
  videos: Video[],
  onProgress: (current: number, total: number) => void,
): Promise<{ songs: Song[]; updatedVideos: Video[] }> {
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
  const songs: Song[] = []
  const updatedVideos = [...videos]

  for (let i = 0; i < videos.length; i++) {
    const video = videos[i]
    try {
      await delay(200) // Minimal delay between searches
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(video.title)}&type=track&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      if (response.status === 429) {
        console.log("Rate limit reached. Pausing for 5 seconds...")
        await delay(5000) // Pause for 5 seconds when rate limit is hit
        i-- // Retry this iteration
        continue
      }

      const data = await response.json()
      if (data.tracks.items.length > 0) {
        const track = data.tracks.items[0]
        songs.push({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
        })
        updatedVideos[i].songFound = true
      } else {
        updatedVideos[i].songFound = false
      }
    } catch (error) {
      console.error(`Error searching for "${video.title}":`, error)
      updatedVideos[i].songFound = false
    }
    onProgress(i + 1, videos.length)
  }

  console.log("Spotify songs found:", songs)
  return { songs, updatedVideos }
}

async function createSpotifyPlaylist(accessToken: string, playlistName: string, trackUris: string[]) {
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  try {
    // Step 1: Get the user's Spotify ID
    const userResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    if (!userResponse.ok) throw new Error("Failed to fetch user data")
    const userData = await userResponse.json()
    const userId = userData.id

    // Step 2: Create a new playlist
    const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: playlistName,
        description: "Created with YouTube to Spotify Playlist Creator",
        public: false,
      }),
    })
    if (!createPlaylistResponse.ok) throw new Error("Failed to create playlist")
    const playlistData = await createPlaylistResponse.json()

    // Step 3: Add tracks to the playlist (in batches of 100 due to API limitations)
    const batchSize = 100
    for (let i = 0; i < trackUris.length; i += batchSize) {
      const batch = trackUris.slice(i, i + batchSize)
      const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: batch,
        }),
      })
      if (!addTracksResponse.ok) throw new Error("Failed to add tracks to playlist")

      // Add a small delay between batches to avoid rate limiting
      await delay(1000)
    }

    return { id: playlistData.id, name: playlistData.name }
  } catch (error) {
    console.error("Error creating Spotify playlist:", error)
    throw error
  }
}

export default function Home() {
  const { data: session, status } = useSession()
  const [youtubeVideos, setYoutubeVideos] = useState<Video[]>([])
  const [spotifySongs, setSpotifySongs] = useState<Song[]>([])
  const [playlistName, setPlaylistName] = useState("")
  const [currentProgress, setCurrentProgress] = useState(0)
  const [searchProgress, setSearchProgress] = useState({ current: 0, total: 0 })
  const [visibleItems, setVisibleItems] = useState<{ video: Video; song?: Song }[]>([])
  const [showSharePopup, setShowSharePopup] = useState(false)
  const [createdPlaylistId, setCreatedPlaylistId] = useState("")
  const [createdPlaylistName, setCreatedPlaylistName] = useState("")

  // Flag to prevent automatic Spotify connection
  const [shouldConnectSpotify, setShouldConnectSpotify] = useState(false)

  // Pagination for better performance with large lists
  const PAGE_SIZE = 50
  const [page, setPage] = useState(1)

  // Add a ref to track if we've already initiated the search to prevent duplicate calls:
  const searchInitiatedRef = useRef(false)

  // Current step for the progress indicator
  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = 5

  // Add a new state variable `isSearchingSpotifySongs` after the existing state declarations:
  const [isSearchingSpotifySongs, setIsSearchingSpotifySongs] = useState(false)

  // Update visible items when videos or songs change
  useEffect(() => {
    const items = youtubeVideos.map((video) => {
      const matchingSong = spotifySongs.find(
        (_, index) => index < youtubeVideos.length && youtubeVideos[index].id === video.id,
      )
      return { video, song: matchingSong }
    })

    const start = 0
    const end = Math.min(items.length, PAGE_SIZE)
    setVisibleItems(items.slice(start, end))
    setPage(1)
  }, [youtubeVideos, spotifySongs])

  // Load more items when scrolling
  const loadMoreItems = useCallback(() => {
    const nextPage = page + 1
    const start = (nextPage - 1) * PAGE_SIZE

    const items = youtubeVideos.map((video) => {
      const matchingSong = spotifySongs.find(
        (_, index) => index < youtubeVideos.length && youtubeVideos[index].id === video.id,
      )
      return { video, song: matchingSong }
    })

    const end = Math.min(items.length, nextPage * PAGE_SIZE)

    if (start < items.length) {
      setVisibleItems((prev) => [...prev, ...items.slice(start, end)])
      setPage(nextPage)
    }
  }, [page, youtubeVideos, spotifySongs])

  const steps: Step[] = [
    {
      title: "Connect Facebook",
      description: "Sign in with your Facebook account",
      status: "pending",
    },
    {
      title: "Fetch Videos",
      description: "Getting your shared YouTube videos from Facebook",
      status: "pending",
    },
    {
      title: "Connect Spotify",
      description: "Link your Spotify account",
      status: "pending",
    },
    {
      title: "Create Playlist",
      description: "Finding songs on Spotify and creating your playlist",
      status: "pending",
    },
  ]

  const [currentSteps, setCurrentSteps] = useState(steps)

  const {
    isLoading: isLoadingVideos,
    isError: isErrorVideos,
    error: errorVideos,
    refetch: refetchVideos,
    isFetching: isFetchingVideos,
  } = useQuery({
    queryKey: ["youtubeVideos"],
    queryFn: async () => {
      try {
        setCurrentSteps((prev) => {
          const newSteps = [...prev]
          newSteps[1].status = "loading"
          return newSteps
        })

        // Update progress step
        setCurrentStep(1)

        const videos = await fetchFacebookYouTubeVideos(session?.accessToken as string)
        setYoutubeVideos(videos)
        localStorage.setItem(STORAGE_KEY_VIDEOS, JSON.stringify(videos))

        // Schedule Spotify connection after the current execution context
        if (session?.provider === "facebook") {
          window.setTimeout(() => {
            signIn("spotify")
          }, 1000)
        }

        return videos
      } catch (error) {
        console.error("Error fetching YouTube videos:", error)
        throw error
      }
    },
    enabled: false,
    onSuccess: (data) => {
      console.log("Data fetched successfully:", data)
      setCurrentSteps((prev) => {
        const newSteps = [...prev]
        newSteps[1].status = "completed"
        return newSteps
      })
      setCurrentProgress(50)
      setCurrentStep(2) // Move to Spotify connection step

      // We're now handling the Spotify connection directly in the queryFn
      setShouldConnectSpotify(true)
    },
    onError: (error) => {
      console.error("Error in YouTube videos query:", error)
      setCurrentSteps((prev) => {
        const newSteps = [...prev]
        newSteps[1].status = "pending"
        return newSteps
      })
    },
  })

  const handleSpotifyConnect = useCallback(() => {
    signIn("spotify")
  }, [])

  const handleFetchVideos = useCallback(async () => {
    if (session?.provider === "facebook") {
      try {
        await refetchVideos()
        // We no longer need to handle Spotify connection here as it's done in onSuccess
      } catch (error) {
        console.error("Error fetching videos:", error)
        // Optionally, you can show an error message to the user here
      }
    }
  }, [session, refetchVideos])

  useEffect(() => {
    if (session?.provider === "facebook") {
      setCurrentProgress(25)
      setCurrentSteps((prev) => {
        const newSteps = [...prev]
        newSteps[0].status = "completed"
        return newSteps
      })
      setCurrentStep(1) // Move to fetching videos step

      // Automatically fetch videos when connected to Facebook
      handleFetchVideos()
    }
  }, [session, handleFetchVideos])

  const {
    mutate: searchSongs,
    isLoading: isSearchingSongs,
    error: searchError,
  } = useMutation({
    mutationFn: (videos: Video[]) => {
      setSearchProgress({ current: 0, total: videos.length })
      setCurrentStep(3) // Move to searching songs step
      return searchSpotifySongs(session?.accessToken as string, videos, (current, total) =>
        setSearchProgress({ current, total }),
      )
    },
    onMutate: () => {
      // This runs immediately when the mutation is called, before the mutationFn
      setCurrentSteps((prev) => {
        const newSteps = [...prev]
        newSteps[3].status = "loading"
        return newSteps
      })
    },
    onSuccess: (data) => {
      setSpotifySongs(data.songs)
      setYoutubeVideos(data.updatedVideos)

      // Store both videos and songs in localStorage
      localStorage.setItem(STORAGE_KEY_VIDEOS, JSON.stringify(data.updatedVideos))
      localStorage.setItem(STORAGE_KEY_SONGS, JSON.stringify(data.songs))

      setCurrentSteps((prev) => {
        const newSteps = [...prev]
        newSteps[3].status = "completed"
        return newSteps
      })
      setCurrentProgress(75)
      setCurrentStep(4) // Move to create playlist step
      searchInitiatedRef.current = false // Reset the ref
      setIsSearchingSpotifySongs(false) // Reset search state
    },
    onError: (error) => {
      console.error("Error searching songs:", error)
      setCurrentSteps((prev) => {
        const newSteps = [...prev]
        newSteps[3].status = "pending"
        return newSteps
      })
      searchInitiatedRef.current = false // Reset the ref
      setIsSearchingSpotifySongs(false) // Reset search state
    },
  })

  const {
    mutate: createPlaylist,
    isLoading: isCreatingPlaylist,
    error: createPlaylistError,
  } = useMutation({
    mutationFn: (name: string) => {
      setCurrentSteps((prev) => {
        const newSteps = [...prev]
        newSteps[3].status = "loading"
        return newSteps
      })
      return createSpotifyPlaylist(
        session?.accessToken as string,
        name,
        spotifySongs.map((song) => `spotify:track:${song.id}`),
      )
    },
    onSuccess: (data) => {
      setCurrentSteps((prev) => {
        const newSteps = [...prev]
        newSteps[3].status = "completed"
        return newSteps
      })
      setCurrentProgress(100)
      setCurrentStep(5) // Move to share step
      setCreatedPlaylistId(data.id)
      setCreatedPlaylistName(data.name)
      setShowSharePopup(true)
    },
    onError: (error) => {
      console.error("Error creating playlist:", error)
      setCurrentSteps((prev) => {
        const newSteps = [...prev]
        newSteps[3].status = "pending"
        return newSteps
      })
      alert("Failed to create playlist. Please try again.")
    },
  })

  const handleRemoveItem = useCallback(
    (id: string) => {
      setYoutubeVideos((videos) => videos.filter((video) => video.id !== id))
      // Also remove the corresponding song if it exists
      setSpotifySongs((songs) => {
        const videoIndex = youtubeVideos.findIndex((v) => v.id === id)
        if (videoIndex >= 0 && videoIndex < songs.length) {
          return songs.filter((_, index) => index !== videoIndex)
        }
        return songs
      })
    },
    [youtubeVideos],
  )

  const handleInitiatePlaylistCreation = useCallback(() => {
    if (youtubeVideos.length > 0 && !isSearchingSpotifySongs) {
      setIsSearchingSpotifySongs(true)
      searchSongs(youtubeVideos)
    } else {
      console.log("No YouTube videos found or search already in progress")
    }
  }, [searchSongs, youtubeVideos, isSearchingSpotifySongs])

  // Separate effect for handling Spotify session
  useEffect(() => {
    if (session?.provider === "spotify") {
      setCurrentSteps((prev) => {
        const newSteps = [...prev]
        newSteps[2].status = "completed"
        return newSteps
      })

      // If we already have songs, move to create playlist step
      if (spotifySongs.length > 0) {
        setCurrentProgress(75)
        setCurrentStep(4) // Move to create playlist step
      } else {
        setCurrentProgress(75)
        setCurrentStep(3) // Move to searching songs step

        // Only initiate playlist creation if we don't already have Spotify songs
        if (youtubeVideos.length > 0 && !searchInitiatedRef.current && spotifySongs.length === 0) {
          searchInitiatedRef.current = true
          handleInitiatePlaylistCreation()
        }
      }
    }
  }, [session, youtubeVideos.length, spotifySongs.length, handleInitiatePlaylistCreation])

  // Load stored data on component mount
  useEffect(() => {
    const storedVideos = localStorage.getItem(STORAGE_KEY_VIDEOS)
    const storedSongs = localStorage.getItem(STORAGE_KEY_SONGS)

    if (storedVideos) {
      const parsedVideos = JSON.parse(storedVideos)
      setYoutubeVideos(parsedVideos)
      setCurrentSteps((prev) => {
        const newSteps = [...prev]
        newSteps[0].status = "completed" // Facebook step completed
        newSteps[1].status = "completed" // Videos fetched
        return newSteps
      })
      setCurrentProgress(50)
      setShouldConnectSpotify(true)

      if (storedSongs) {
        const parsedSongs = JSON.parse(storedSongs)
        setSpotifySongs(parsedSongs)
        setCurrentSteps((prev) => {
          const newSteps = [...prev]
          newSteps[0].status = "completed" // Facebook step completed
          newSteps[1].status = "completed" // Videos fetched
          newSteps[2].status = "completed" // Spotify connected (will be updated when session loads)
          newSteps[3].status = "completed" // Songs found
          return newSteps
        })
        setCurrentProgress(75)
        setCurrentStep(4) // Move to create playlist step
      } else {
        setCurrentStep(2) // Move to Spotify connection step
      }
    }
  }, [])

  // Memoize the track URIs to prevent unnecessary recalculations
  const trackUris = useMemo(() => spotifySongs.map((song) => `spotify:track:${song.id}`), [spotifySongs])

  // Stats for display
  const songStats = useMemo(() => {
    const totalSongs = spotifySongs.length
    const totalVideos = youtubeVideos.length
    const matchedSongs = youtubeVideos.filter((v) => v.songFound).length
    return { totalSongs, totalVideos, matchedSongs }
  }, [spotifySongs.length, youtubeVideos])

  // Progress steps for the UI
  const progressSteps = [
    { label: "Start", icon: <LogIn className="h-4 w-4" /> },
    { label: "Facebook", icon: <Facebook className="h-4 w-4" /> },
    { label: "Spotify", icon: <Spotify className="h-4 w-4" /> },
    { label: "Search", icon: <RefreshCw className="h-4 w-4" /> },
    { label: "Create", icon: <Music className="h-4 w-4" /> },
    { label: "Share", icon: <Share2 className="h-4 w-4" /> },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-purple-900 via-pink-800 to-red-900">
      {/* Header */}
      <header className="py-6 px-4 bg-black bg-opacity-30 backdrop-blur-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white">YouTube to Spotify</h1>
          {session && (
            <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })} className="text-white">
              Sign Out
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {progressSteps.map((step, index) => (
              <div
                key={step.label}
                className={`flex flex-col items-center ${index <= currentStep ? "text-white" : "text-gray-400"}`}
              >
                <div
                  className={`
                  w-10 h-10 rounded-full flex items-center justify-center mb-1
                  ${
                    index < currentStep
                      ? "bg-green-500"
                      : index === currentStep
                        ? "bg-blue-500 animate-pulse"
                        : "bg-gray-700"
                  }
                `}
                >
                  {index < currentStep ? <CheckCircle className="h-5 w-5" /> : step.icon}
                </div>
                <span className="text-xs hidden md:block">{step.label}</span>
              </div>
            ))}
          </div>
          <Progress value={(currentStep / (progressSteps.length - 1)) * 100} className="h-2" />
        </div>

        {/* Welcome Screen */}
        {!session && currentStep === 0 && (
          <Card className="bg-black bg-opacity-50 backdrop-blur-md border-none text-white">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <h2 className="text-3xl font-bold mb-4">Create Spotify Playlists from YouTube Videos</h2>
              <p className="mb-8 max-w-2xl">
                Turn your Facebook-shared YouTube videos into a Spotify playlist in just a few clicks! We'll find
                matching songs on Spotify and create a playlist for you.
              </p>
              <Button size="lg" onClick={() => signIn("facebook")} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Facebook className="mr-2 h-5 w-5" /> Start with Facebook
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Facebook Connected, Fetching Videos */}
        {session?.provider === "facebook" && currentStep === 1 && (
          <Card className="bg-black bg-opacity-50 backdrop-blur-md border-none text-white">
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                <h2 className="text-xl font-bold">Facebook Connected</h2>
              </div>

              {isFetchingVideos ? (
                <div className="flex flex-col items-center py-8">
                  <Loader2 className="h-12 w-12 animate-spin mb-4" />
                  <p className="text-lg">Fetching your YouTube videos from Facebook...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <Button
                    size="lg"
                    onClick={handleFetchVideos}
                    disabled={isFetchingVideos}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <RefreshCw className="mr-2 h-5 w-5" /> Fetch YouTube Videos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Connect Spotify */}
        {shouldConnectSpotify && session?.provider === "facebook" && currentStep === 2 && (
          <Card className="bg-black bg-opacity-50 backdrop-blur-md border-none text-white">
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                <h2 className="text-xl font-bold">Videos Found: {youtubeVideos.length}</h2>
              </div>

              <div className="flex flex-col items-center py-8">
                <p className="text-lg mb-6">Now connect your Spotify account to continue</p>
                <Button size="lg" onClick={handleSpotifyConnect} className="bg-green-600 hover:bg-green-700 text-white">
                  <Spotify className="mr-2 h-5 w-5" /> Connect Spotify
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Searching Songs */}
        {session?.provider === "spotify" && currentStep === 3 && (
          <Card className="bg-black bg-opacity-50 backdrop-blur-md border-none text-white">
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                <h2 className="text-xl font-bold">Spotify Connected</h2>
              </div>

              {isSearchingSpotifySongs ? (
                <div className="flex flex-col items-center py-8">
                  <Loader2 className="h-12 w-12 animate-spin mb-4" />
                  <p className="text-lg mb-2">Searching for songs on Spotify...</p>
                  <p className="text-md mb-4 font-semibold">
                    {searchProgress.current}/{searchProgress.total} Songs Searched
                  </p>
                  <div className="w-full max-w-md mb-2">
                    <Progress value={(searchProgress.current / searchProgress.total) * 100} className="h-2" />
                  </div>
                  <p className="text-sm text-gray-300">
                    {searchProgress.current} of {searchProgress.total} videos processed
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <Button
                    size="lg"
                    onClick={handleInitiatePlaylistCreation}
                    disabled={isSearchingSpotifySongs}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <RefreshCw className="mr-2 h-5 w-5" /> Find Matching Songs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Playlist Creation - Show after videos are fetched */}
        {youtubeVideos.length > 0 && (
          <div className="space-y-6">
            {/* Playlist Stats */}
            <Card className="bg-black bg-opacity-50 backdrop-blur-md border-none text-white">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <h2 className="text-2xl font-bold mb-2 md:mb-0">Your Playlist</h2>
                  <div className="flex space-x-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-300">Videos</p>
                      <p className="text-xl font-bold">{songStats.totalVideos}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-300">Matches</p>
                      <p className="text-xl font-bold">{songStats.matchedSongs}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-300">Success Rate</p>
                      <p className="text-xl font-bold">
                        {songStats.totalVideos > 0
                          ? Math.round((songStats.matchedSongs / songStats.totalVideos) * 100)
                          : 0}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Playlist Items */}
            <Card className="bg-black bg-opacity-50 backdrop-blur-md border-none text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Playlist Items</h3>
                  {spotifySongs.length > 0 && (
                    <div className="flex items-center">
                      <Input
                        type="text"
                        placeholder="Enter playlist name"
                        value={playlistName}
                        onChange={(e) => setPlaylistName(e.target.value)}
                        className="mr-2 bg-white bg-opacity-10 border-gray-700 text-white"
                      />
                      <Button
                        onClick={() => createPlaylist(playlistName)}
                        disabled={isCreatingPlaylist || !playlistName || spotifySongs.length === 0}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isCreatingPlaylist ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                          </>
                        ) : (
                          <>
                            <Music className="mr-2 h-4 w-4" /> Create
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <ScrollArea className="h-[50vh] pr-4">
                  <ul className="space-y-2">
                    {visibleItems.map((item) => (
                      <PlaylistItem
                        key={item.video.id}
                        video={item.video}
                        song={item.song}
                        onRemove={handleRemoveItem}
                      />
                    ))}
                    {visibleItems.length < youtubeVideos.length && (
                      <li className="text-center p-2">
                        <Button variant="ghost" onClick={loadMoreItems} className="text-white">
                          Load more items
                        </Button>
                      </li>
                    )}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Share Popup */}
        {showSharePopup && (
          <SharePopup
            playlistId={createdPlaylistId}
            playlistName={createdPlaylistName}
            onClose={() => setShowSharePopup(false)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
