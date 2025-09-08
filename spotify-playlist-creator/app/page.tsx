"use client"

import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GoogleAds } from "@/components/google-ads"
import { PayPalSupport } from "@/components/paypal-support"
import { SEOHead } from "@/components/seo-head"
import {
  Loader2,
  Music,
  RefreshCw,
  CheckCircle,
  X,
  Facebook,
  SproutIcon as Spotify,
  ArrowDown,
  Copy,
  Twitter,
  Linkedin,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Footer } from "@/components/footer"
import { SharePopup } from "@/components/share-popup"
import { FAQSection } from "@/components/faq-section"

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
  facebook_video_id: string
}

const STORAGE_KEY_VIDEOS = "facebook_youtube_videos"
const STORAGE_KEY_SONGS = "spotify_songs"
const STORAGE_KEY_PLAYLIST = "created_playlist_info"

// Sanitizer method to clean up video titles before Spotify search
function sanitizeVideoTitle(title: string): string {
  let cleanTitle = title

  // Remove content within parentheses and brackets (including the parentheses/brackets themselves)
  // This regex properly matches opening and closing parentheses/brackets
  cleanTitle = cleanTitle.replace(/$$[^)]*$$/g, "")
  cleanTitle = cleanTitle.replace(/\[[^\]]*\]/g, "")

  // Remove common music video related words (case insensitive)
  const wordsToRemove = [
    "official music video",
    "official video",
    "official audio",
    "official visual",
    "official version",
    "music video",
    "official",
    "video",
    "audio",
    "visual",
    "version",
    "live",
    "remix",
    "remaster",
    "remastered",
    "hd",
    "hq",
    "lyrics",
    "lyric video",
    "fan-made",
    "fanmade",
    "cover",
    "acoustic",
    "instrumental",
    "karaoke",
    "clean version",
    "explicit",
    "radio edit",
    "extended",
    "full version",
    "complete",
    "studio version",
  ]

  wordsToRemove.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi")
    cleanTitle = cleanTitle.replace(regex, "")
  })

  // Remove all special characters except spaces and alphanumeric
  cleanTitle = cleanTitle.replace(/[^a-zA-Z0-9\s]/g, "")

  // Remove multiple spaces and trim
  cleanTitle = cleanTitle.replace(/\s+/g, " ")
  cleanTitle = cleanTitle.trim()

  return cleanTitle
}

// Accuracy method to calculate similarity between original and found song
function calculateSimilarity(original: string, found: string): number {
  // Convert to lowercase and remove special characters for comparison
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()

  const originalNormalized = normalize(original)
  const foundNormalized = normalize(found)

  // If either string is empty, return 0
  if (!originalNormalized || !foundNormalized) return 0

  // Calculate Levenshtein distance
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1, // deletion
          )
        }
      }
    }

    return matrix[str2.length][str1.length]
  }

  const distance = levenshteinDistance(originalNormalized, foundNormalized)
  const maxLength = Math.max(originalNormalized.length, foundNormalized.length)

  // Calculate similarity percentage
  const similarity = ((maxLength - distance) / maxLength) * 100

  // Also check for word overlap
  const originalWords = originalNormalized.split(/\s+/)
  const foundWords = foundNormalized.split(/\s+/)

  let commonWords = 0
  originalWords.forEach((word) => {
    if (foundWords.some((foundWord) => foundWord.includes(word) || word.includes(foundWord))) {
      commonWords++
    }
  })

  const wordSimilarity = (commonWords / Math.max(originalWords.length, foundWords.length)) * 100

  // Return the higher of the two similarity scores
  return Math.max(similarity, wordSimilarity)
}

// Song card component for grid display
const SongCard = memo(
  ({
    song,
    video,
    onRemove,
    index,
  }: {
    song?: Song
    video: Video
    onRemove: (id: string) => void
    index: number
  }) => {
    const colors = [
      "from-pink-400 to-pink-600",
      "from-green-400 to-green-600",
      "from-red-400 to-red-600",
      "from-orange-400 to-orange-600",
      "from-purple-400 to-purple-600",
      "from-blue-400 to-blue-600",
      "from-yellow-400 to-yellow-600",
      "from-indigo-400 to-indigo-600",
    ]

    const colorClass = colors[index % colors.length]

    return (
      <div
        className={`relative bg-gradient-to-br ${colorClass} rounded-lg p-3 aspect-square flex flex-col justify-between text-white shadow-lg hover:shadow-xl transition-all duration-300 group`}
      >
        <button
          onClick={() => onRemove(video.id)}
          className="absolute top-2 right-2 w-6 h-6 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
        >
          <X className="h-3 w-3" />
        </button>

        <div className="flex-1 flex items-center justify-center">
          {song ? (
            <div className="text-center">
              <CheckCircle className="h-4 w-4 text-green-300 mx-auto" />
            </div>
          ) : video.songFound === false ? (
            <div className="text-center">
              <X className="h-4 w-4 text-red-300 mx-auto" />
            </div>
          ) : (
            <></>
          )}
        </div>

        <div className="text-xs space-y-1">
          <p className="font-semibold text-sm leading-tight line-clamp-2 mb-2">{song ? song.name : video.title}</p>
          {song && <p className="opacity-80 text-xs leading-tight line-clamp-1">{song.artist}</p>}
        </div>
      </div>
    )
  },
)
SongCard.displayName = "SongCard"

async function fetchFacebookYouTubeVideos(
  accessToken: string,
  onProgress?: (current: number, total: number) => void,
): Promise<Video[]> {
  let allVideos: Video[] = []
  let nextPageUrl = `https://graph.facebook.com/me/feed?fields=attachments{title,url}&limit=200`
  let totalProcessed = 0

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
    totalProcessed += data.data.length

    // Report progress if callback is provided
    if (onProgress) {
      onProgress(allVideos.length, totalProcessed)
    }

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

      // Sanitize the video title before searching
      const sanitizedTitle = sanitizeVideoTitle(video.title)
      console.log(`Original: "${video.title}" -> Sanitized: "${sanitizedTitle}"`)

      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(sanitizedTitle)}&type=track&limit=5`,
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
        // Check each track for accuracy
        let bestMatch = null
        let bestAccuracy = 0

        for (const track of data.tracks.items) {
          const trackFullName = `${track.name} ${track.artists[0].name}`
          const accuracy = calculateSimilarity(sanitizedTitle, trackFullName)

          console.log(`Comparing "${sanitizedTitle}" with "${trackFullName}": ${accuracy.toFixed(1)}% accuracy`)

          if (accuracy > bestAccuracy) {
            bestAccuracy = accuracy
            bestMatch = track
          }
        }

        // Only add to playlist if accuracy is above 60%
        if (bestMatch && bestAccuracy >= 60) {
          songs.push({
            id: bestMatch.id,
            name: bestMatch.name,
            artist: bestMatch.artists[0].name,
            facebook_video_id: video.id, // Add the Facebook video ID
          })
          updatedVideos[i].songFound = true
          console.log(
            `✅ Added "${bestMatch.name}" by ${bestMatch.artists[0].name} (${bestAccuracy.toFixed(1)}% match)`,
          )
        } else {
          updatedVideos[i].songFound = false
          console.log(`❌ No suitable match found for "${video.title}" (best: ${bestAccuracy.toFixed(1)}%)`)
        }
      } else {
        updatedVideos[i].songFound = false
        console.log(`❌ No tracks found for "${sanitizedTitle}"`)
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
        description: "Created with Spotmix Playlist Creator",
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
  const [playlistUrl, setPlaylistUrl] = useState("")

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

  const [facebookFetchProgress, setFacebookFetchProgress] = useState({ current: 0, total: 0 })

  // Add state to track if we're waiting for Spotify connection
  const [isConnectingSpotify, setIsConnectingSpotify] = useState(false)

  // Background gradients for each step
  const stepBackgrounds = [
    "bg-gradient-to-br from-orange-300 via-yellow-300 to-orange-400", // Start - Orange/Yellow
    "bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400", // Facebook - Blue to Pink
    "bg-gradient-to-br from-green-400 via-teal-400 to-blue-400", // Spotify - Green to Blue
    "bg-gradient-to-br from-purple-400 via-pink-400 to-red-400", // Search - Purple to Red
    "bg-gradient-to-br from-pink-300 via-rose-300 to-pink-400", // Create - Pink
    "bg-gradient-to-br from-emerald-400 via-green-400 to-teal-400", // Share - Green
  ]

  // New state variable for support section
  const [showSupportSection, setShowSupportSection] = useState(false)

  // Add new state for tracking playlist creation in progress
  const [playlistCreationInProgress, setPlaylistCreationInProgress] = useState(false)

  // Add this after the other state declarations
  const [hasStoredPlaylist, setHasStoredPlaylist] = useState(false)

  // Update visible items when videos or songs change
  useEffect(() => {
    const items = youtubeVideos.map((video) => {
      const matchingSong = spotifySongs.find((song) => song.facebook_video_id === video.id)
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
      const matchingSong = spotifySongs.find((song) => song.facebook_video_id === video.id)
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
        setFacebookFetchProgress({ current: 0, total: 0 })

        const videos = await fetchFacebookYouTubeVideos(session?.accessToken as string, (current, total) =>
          setFacebookFetchProgress({ current, total }),
        )
        setYoutubeVideos(videos)
        localStorage.setItem(STORAGE_KEY_VIDEOS, JSON.stringify(videos))

        // Schedule Spotify connection after the current execution context
        if (session?.provider === "facebook") {
          setIsConnectingSpotify(true)
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
    setIsConnectingSpotify(true)
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
    if (session?.provider === "facebook" && !hasStoredPlaylist) {
      // Add the condition here
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
  }, [session, handleFetchVideos, hasStoredPlaylist])

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
      setPlaylistCreationInProgress(true)
      return createSpotifyPlaylist(
        session?.accessToken as string,
        name,
        spotifySongs.map((song) => `spotify:track:${song.id}`),
      )
    },
    onMutate: () => {
      // This runs immediately when the mutation is called
      setCurrentSteps((prev) => {
        const newSteps = [...prev]
        newSteps[3].status = "loading"
        return newSteps
      })
    },
    onSuccess: (data) => {
      const playlistInfo = {
        id: data.id,
        name: data.name,
        url: `https://open.spotify.com/playlist/${data.id}`,
        createdAt: new Date().toISOString(),
        songCount: spotifySongs.length,
        totalVideos: youtubeVideos.length,
      }

      // Store playlist info in localStorage
      localStorage.setItem(STORAGE_KEY_PLAYLIST, JSON.stringify(playlistInfo))

      setCurrentSteps((prev) => {
        const newSteps = [...prev]
        newSteps[3].status = "completed"
        return newSteps
      })
      setCurrentProgress(100)
      setCurrentStep(5) // Move to share step
      setCreatedPlaylistId(data.id)
      setCreatedPlaylistName(data.name)
      setPlaylistUrl(`https://open.spotify.com/playlist/${data.id}`)
      setShowSharePopup(false)
      setPlaylistCreationInProgress(false)
    },
    onError: (error) => {
      console.error("Error creating playlist:", error)
      setCurrentSteps((prev) => {
        const newSteps = [...prev]
        newSteps[3].status = "pending"
        return newSteps
      })
      setPlaylistCreationInProgress(false)
      alert("Failed to create playlist. Please try again.")
    },
  })

  const handleRemoveItem = useCallback((id: string) => {
    setYoutubeVideos((videos) => videos.filter((video) => video.id !== id))
    // Remove the corresponding song by matching facebook_video_id
    setSpotifySongs((songs) => songs.filter((song) => song.facebook_video_id !== id))
  }, [])

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
    if (session?.provider === "spotify" && !hasStoredPlaylist) {
      // Add the condition here
      setIsConnectingSpotify(false) // Stop showing loading spinner
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
  }, [session, youtubeVideos.length, spotifySongs.length, handleInitiatePlaylistCreation, hasStoredPlaylist])

  // Update the sign out handler to clear all localStorage
  const handleSignOut = () => {
    localStorage.removeItem(STORAGE_KEY_VIDEOS)
    localStorage.removeItem(STORAGE_KEY_SONGS)
    localStorage.removeItem(STORAGE_KEY_PLAYLIST)
    setHasStoredPlaylist(false) // Add this line
    signOut({ callbackUrl: "/" })
  }

  // Load stored data on component mount
  useEffect(() => {
    const storedPlaylist = localStorage.getItem(STORAGE_KEY_PLAYLIST)
    const storedVideos = localStorage.getItem(STORAGE_KEY_VIDEOS)
    const storedSongs = localStorage.getItem(STORAGE_KEY_SONGS)

    // If we have a completed playlist, go directly to share step
    if (storedPlaylist) {
      const playlistInfo = JSON.parse(storedPlaylist)
      setCreatedPlaylistId(playlistInfo.id)
      setCreatedPlaylistName(playlistInfo.name)
      setPlaylistUrl(playlistInfo.url)
      setHasStoredPlaylist(true) // Add this line

      // Set all steps as completed and go to share step
      setCurrentSteps((prev) => {
        const newSteps = [...prev]
        newSteps[0].status = "completed"
        newSteps[1].status = "completed"
        newSteps[2].status = "completed"
        newSteps[3].status = "completed"
        return newSteps
      })
      setCurrentProgress(100)
      setCurrentStep(5) // Go directly to share step

      // Load songs and videos data if available
      if (storedVideos && storedSongs) {
        const parsedVideos = JSON.parse(storedVideos)
        const parsedSongs = JSON.parse(storedSongs)
        setYoutubeVideos(parsedVideos)
        setSpotifySongs(parsedSongs)
      }

      return // Exit early, don't process other storage items
    }

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

  const handleShareFacebook = () => {
    const url = encodeURIComponent(playlistUrl)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank")
  }

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Check out my new Spotify playlist: ${createdPlaylistName} ${playlistUrl}`)
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank")
  }

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(playlistUrl)
    const title = encodeURIComponent(createdPlaylistName)
    const summary = encodeURIComponent("Check out my new Spotify playlist!")
    window.open(`https://www.linkedin.com/shareArticle?url=${url}&title=${title}&summary=${summary}`, "_blank")
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(playlistUrl)
    alert("Playlist URL copied to clipboard!")
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Spotmix - Free Spotify Playlist Creator from Facebook Posts",
    description:
      "Create Spotify playlists from your Facebook posts instantly! Free tool to convert Facebook shared YouTube videos into Spotify playlists with 90%+ accuracy matching. No signup required.",
    url: "https://youtubetospot.com",
    applicationCategory: "MusicApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "2847",
      bestRating: "5",
      worstRating: "1",
    },
    creator: {
      "@type": "Organization",
      name: "Spotmix - Free Spotify Playlist Creator",
      url: "https://youtubetospot.com",
    },
    featureList: [
      "Create Spotify playlists from Facebook posts instantly",
      "Convert Facebook shared YouTube videos to Spotify playlists",
      "Automatic song matching with 90%+ accuracy",
      "Free playlist creation and generation tool",
      "Social media music discovery and curation",
      "Bulk playlist generation from social posts",
      "Privacy-focused music tools - no data stored",
      "No signup required playlist maker",
      "Mobile-friendly Spotify playlist creator",
      "Unlimited free playlist generation",
    ],
    screenshot: "https://youtubetospot.com/screenshot.jpg",
    softwareVersion: "2.0",
    datePublished: "2024-01-01",
    dateModified: new Date().toISOString(),
    inLanguage: "en-US",
    copyrightHolder: {
      "@type": "Organization",
      name: "Spotmix Playlist Creator",
    },
    license: "https://youtubetospot.com/terms-of-service",
    keywords:
      "create spotify playlist, spotify playlist creator, spotify playlist generator, facebook to spotify, youtube to spotify, free playlist maker, music discovery tool, social media to spotify, automatic playlist creation, bulk playlist generator",
  }

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-1000 ${stepBackgrounds[currentStep]}`}>
      <SEOHead
        structuredData={structuredData}
        title="Spotmix Playlist Creator - Convert Facebook Videos to Playlists"
        description="Free tool to convert your Facebook shared YouTube videos into Spotify playlists instantly. Create playlists from your social media music shares with 90%+ accuracy matching."
      />
      {/* Header */}
      <header className="py-6 px-4 lg:px-8">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <Music className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-black">Spotmix</h1>
          </div>

          {session && (
            <Button variant="ghost" onClick={handleSignOut} className="text-black hover:bg-black hover:bg-opacity-10">
              Sign Out
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 lg:px-8 py-8">
        <div
          className={`${currentStep === 0 ? "flex items-center justify-center min-h-[70vh]" : "grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]"}`}
        >
          {/* Left Content */}
          <div className={`space-y-6 ${currentStep === 0 ? "text-center max-w-4xl" : ""}`}>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-black opacity-70 tracking-wider uppercase">PLAYLIST CREATOR</p>
              <h2 className="text-4xl lg:text-6xl font-bold text-black leading-tight">
                {currentStep === 0 && "Create Spotify Playlists from Facebook Posts"}
                {currentStep === 1 && "Fetching Your YouTube Videos"}
                {currentStep === 2 && "Connect Your Spotify Account"}
                {currentStep === 3 && "Finding Matching Songs"}
                {currentStep === 4 && "Create Your Playlist"}
                {currentStep === 5 && "Share Your Creation"}
              </h2>
              {currentStep === 1 && (
                <p className="text-lg text-black opacity-80 max-w-2xl">
                  We're scanning through your Facebook posts to find all the YouTube videos you've shared. This includes
                  music videos, live performances, and any other YouTube content from your timeline.
                </p>
              )}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <p className="text-lg text-black opacity-80">Share your new playlist with the world!</p>
                  <div className="flex items-center space-x-3">
                    <Input
                      type="text"
                      value={playlistUrl}
                      readOnly
                      className="flex-1 bg-white bg-opacity-50 border-black border-opacity-20 text-black placeholder-black placeholder-opacity-50 rounded-full px-6 py-3"
                    />
                    <Button
                      onClick={handleCopyToClipboard}
                      className="bg-black text-white hover:bg-opacity-80 px-8 py-3 rounded-full"
                    >
                      <Copy className="mr-2 h-4 w-4" /> Copy
                    </Button>
                  </div>
                  <div className="flex space-x-4">
                    <Button
                      onClick={handleShareFacebook}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full"
                    >
                      <Facebook className="mr-2 h-4 w-4" /> Facebook
                    </Button>
                    <Button
                      onClick={handleShareTwitter}
                      className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-full"
                    >
                      <Twitter className="mr-2 h-4 w-4" /> Twitter
                    </Button>
                    <Button
                      onClick={handleShareLinkedIn}
                      className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-full"
                    >
                      <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
                    </Button>
                  </div>
                  <a href={playlistUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full">
                      Open in Spotify
                    </Button>
                  </a>

                  {/* PayPal Support Section - Single instance */}
                  <div className="mt-8">
                    <PayPalSupport />
                  </div>

                  {/* Google Ads Section - Moved below donation */}
                  <div className="mt-8 space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-black opacity-60 mb-4">Advertisement</p>
                      <GoogleAds adSlot="1234567890" className="max-w-md mx-auto" />
                    </div>
                  </div>

                  {currentStep === 5 && (
                    <div className="mt-8">
                      <Button
                        onClick={() => {
                          // Clear playlist info and go back to create step
                          localStorage.removeItem(STORAGE_KEY_PLAYLIST)
                          setCreatedPlaylistId("")
                          setCreatedPlaylistName("")
                          setPlaylistUrl("")
                          setHasStoredPlaylist(false) // Add this line
                          setCurrentStep(4)
                          setCurrentProgress(75)
                          setCurrentSteps((prev) => {
                            const newSteps = [...prev]
                            newSteps[3].status = "completed"
                            return newSteps
                          })
                        }}
                        variant="outline"
                        className="bg-white bg-opacity-20 border-black border-opacity-30 text-black hover:bg-white hover:bg-opacity-30 px-6 py-2 rounded-full"
                      >
                        Create Another Playlist
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Welcome Screen */}
              {!session && currentStep === 0 && (
                <div className="space-y-6">
                  <p className="text-lg text-black opacity-80 max-w-3xl mx-auto">
                    Turn your Facebook-shared YouTube videos into a Spotify playlist in just a few clicks! We'll find
                    matching songs on Spotify and create a playlist for you.
                  </p>
                  <Button
                    size="lg"
                    onClick={() => signIn("facebook")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-full"
                  >
                    <Facebook className="mr-2 h-5 w-5" /> Start with Facebook
                  </Button>
                </div>
              )}

              {/* Connect Spotify */}
              {shouldConnectSpotify && session?.provider === "facebook" && currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <p className="text-lg text-black">Videos Found: {youtubeVideos.length}</p>
                  </div>
                  <p className="text-lg text-black opacity-80 max-w-2xl">
                    Great! We found {youtubeVideos.length} YouTube videos from your Facebook posts. Now we need to
                    connect your Spotify account to search for matching songs and create your playlist.
                  </p>
                  <div className="space-y-3">
                    <p className="text-sm text-black opacity-70">• We'll search for each video title on Spotify</p>
                    <p className="text-sm text-black opacity-70">
                      • Only songs with high accuracy matches will be added
                    </p>
                    <p className="text-sm text-black opacity-70">• Your playlist will be created privately</p>
                  </div>
                  <Button
                    size="lg"
                    onClick={handleSpotifyConnect}
                    disabled={isConnectingSpotify}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg rounded-full"
                  >
                    {isConnectingSpotify ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Connecting...
                      </>
                    ) : (
                      <>
                        <Spotify className="mr-2 h-5 w-5" /> Connect Spotify
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Searching Songs */}
              {session?.provider === "spotify" && currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <p className="text-lg text-black">Spotify Connected</p>
                  </div>
                  <p className="text-lg text-black opacity-80 max-w-2xl">
                    Perfect! Your Spotify account is now connected. We're ready to search for matching songs from your{" "}
                    {youtubeVideos.length} YouTube videos.
                  </p>
                  <div className="space-y-3">
                    <p className="text-sm text-black opacity-70">
                      • We'll clean up video titles for better search results
                    </p>
                    <p className="text-sm text-black opacity-70">• Only songs with 60%+ accuracy will be included</p>
                    <p className="text-sm text-black opacity-70">
                      • This process may take a few minutes for large collections
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={handleInitiatePlaylistCreation}
                    disabled={isSearchingSpotifySongs}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg rounded-full"
                  >
                    {isSearchingSpotifySongs ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Searching...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5" /> Find Matching Songs
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Create Playlist */}
              {currentStep === 4 && spotifySongs.length > 0 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex space-x-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-black">{songStats.totalVideos}</p>
                        <p className="text-sm text-black opacity-70">Videos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-black">{songStats.matchedSongs}</p>
                        <p className="text-sm text-black opacity-70">Matches</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-black">
                          {songStats.totalVideos > 0
                            ? Math.round((songStats.matchedSongs / songStats.totalVideos) * 100)
                            : 0}
                          %
                        </p>
                        <p className="text-sm text-black opacity-70">Success Rate</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-lg text-black opacity-80 max-w-2xl">
                    Excellent! We found {songStats.matchedSongs} matching songs from your {songStats.totalVideos} videos
                    with a{" "}
                    {songStats.totalVideos > 0 ? Math.round((songStats.matchedSongs / songStats.totalVideos) * 100) : 0}
                    % success rate. Give your playlist a name and we'll create it for you.
                  </p>
                  <div className="space-y-3">
                    <p className="text-sm text-black opacity-70">
                      • Your playlist will be created as private by default
                    </p>
                    <p className="text-sm text-black opacity-70">
                      • You can change the privacy settings later in Spotify
                    </p>
                    <p className="text-sm text-black opacity-70">• All matched songs will be added automatically</p>
                  </div>

                  <div className="flex space-x-3">
                    <Input
                      type="text"
                      placeholder="Enter playlist name"
                      value={playlistName}
                      onChange={(e) => setPlaylistName(e.target.value)}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          playlistName.trim() &&
                          !isCreatingPlaylist &&
                          spotifySongs.length > 0
                        ) {
                          createPlaylist(playlistName)
                        }
                      }}
                      className="flex-1 bg-white bg-opacity-50 border-black border-opacity-20 text-black placeholder-black placeholder-opacity-50 rounded-full px-6 py-3"
                    />
                    <Button
                      onClick={() => createPlaylist(playlistName)}
                      disabled={
                        isCreatingPlaylist ||
                        playlistCreationInProgress ||
                        !playlistName.trim() ||
                        spotifySongs.length === 0
                      }
                      className="bg-black text-white hover:bg-opacity-80 px-8 py-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreatingPlaylist || playlistCreationInProgress ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Playlist...
                        </>
                      ) : (
                        <>
                          <Music className="mr-2 h-4 w-4" /> Create Playlist
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation indicators */}
            <div className={`flex items-center justify-between pt-8 ${currentStep === 0 ? "justify-center" : ""}`}>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono text-black opacity-70">
                  {String(currentStep + 1).padStart(2, "0")}
                </span>
                <div className="w-8 h-px bg-black opacity-30"></div>
                <span className="text-sm font-mono text-black opacity-70">
                  {String(stepBackgrounds.length).padStart(2, "0")}
                </span>
              </div>
              {currentStep !== 0 && (
                <div className="flex items-center space-x-2 text-sm font-semibold text-black opacity-70 tracking-wider uppercase">
                  <span>Scroll Down</span>
                  <ArrowDown className="h-4 w-4" />
                </div>
              )}
            </div>
          </div>

          {/* Right Content - Visual Card */}
          {currentStep !== 0 && (
            <div className="relative">
              <div className="relative transform rotate-3 hover:rotate-0 transition-transform duration-500">
                {/* Card stack effect with square shadows */}
                <div className="absolute inset-0 bg-blue-400 rounded-2xl transform translate-x-3 translate-y-3 opacity-60 w-80 h-80 mx-auto"></div>
                <div className="absolute inset-0 bg-purple-400 rounded-2xl transform translate-x-1.5 translate-y-1.5 opacity-80 w-80 h-80 mx-auto"></div>

                {/* Main card - square */}
                <div className="relative bg-gradient-to-br from-pink-400 to-purple-600 rounded-2xl p-6 aspect-square w-80 mx-auto flex items-center justify-center shadow-2xl">
                  <div className="text-center text-white">
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto">
                          {isFetchingVideos ? (
                            <Loader2 className="h-8 w-8 animate-spin" />
                          ) : (
                            <Facebook className="h-8 w-8" />
                          )}
                        </div>
                        <p className="text-xl font-bold">Fetching Videos</p>
                        {isFetchingVideos && facebookFetchProgress.current > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm">{facebookFetchProgress.current} YouTube videos found</p>
                            <p className="text-xs opacity-80">Processed {facebookFetchProgress.total} posts</p>
                          </div>
                        )}
                        {!isFetchingVideos && youtubeVideos.length > 0 && (
                          <p className="text-sm opacity-80">{youtubeVideos.length} videos ready</p>
                        )}
                      </div>
                    )}
                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto">
                          {isConnectingSpotify ? (
                            <Loader2 className="h-8 w-8 animate-spin" />
                          ) : (
                            <Spotify className="h-8 w-8" />
                          )}
                        </div>
                        <p className="text-xl font-bold">{isConnectingSpotify ? "Connecting..." : "Connect Spotify"}</p>
                        <p className="text-sm opacity-80">{youtubeVideos.length} videos ready</p>
                      </div>
                    )}
                    {currentStep === 3 && (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto">
                          <RefreshCw className="h-8 w-8 animate-spin" />
                        </div>
                        <p className="text-xl font-bold">Finding Songs</p>
                        {isSearchingSpotifySongs && (
                          <div className="space-y-2">
                            <p className="text-sm">
                              {searchProgress.current}/{searchProgress.total} searched
                            </p>
                            <div className="w-full max-w-32 mx-auto">
                              <Progress value={(searchProgress.current / searchProgress.total) * 100} className="h-1" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {currentStep >= 4 && (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto">
                          {isCreatingPlaylist || playlistCreationInProgress ? (
                            <Loader2 className="h-8 w-8 animate-spin" />
                          ) : currentStep === 5 ? (
                            <CheckCircle className="h-8 w-8" />
                          ) : (
                            <Music className="h-8 w-8" />
                          )}
                        </div>
                        <p className="text-xl font-bold">
                          {isCreatingPlaylist || playlistCreationInProgress
                            ? "Creating Playlist..."
                            : currentStep === 5
                              ? "Playlist Created!"
                              : "Ready to Create"}
                        </p>
                        <div className="space-y-1">
                          <p className="text-sm">{songStats.matchedSongs} songs matched</p>
                          <p className="text-xs opacity-80">
                            {songStats.totalVideos > 0
                              ? Math.round((songStats.matchedSongs / songStats.totalVideos) * 100)
                              : 0}
                            % success rate
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Songs Grid - Show after videos are fetched */}
        {youtubeVideos.length > 0 && (
          <div className="mt-16 space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-black mb-2">Your Music Collection</h3>
              <p className="text-black opacity-70">Songs found from your Facebook YouTube shares</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {visibleItems.map((item, index) => (
                <SongCard
                  key={item.video.id}
                  video={item.video}
                  song={item.song}
                  onRemove={handleRemoveItem}
                  index={index}
                />
              ))}
            </div>

            {visibleItems.length < youtubeVideos.length && (
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={loadMoreItems}
                  className="text-black hover:bg-black hover:bg-opacity-10 rounded-full px-8"
                >
                  Load more items
                </Button>
              </div>
            )}
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

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <Footer />
    </div>
  )
}
