'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Trash2, Music } from 'lucide-react'

async function fetchFacebookYouTubeVideos(accessToken: string) {
  // Implement Facebook API call to fetch feed and filter YouTube videos
  // This is a placeholder implementation
  return [
    { id: '1', title: 'Video 1' },
    { id: '2', title: 'Video 2' },
    { id: '3', title: 'Video 3' },
  ]
}

async function searchSpotifySongs(accessToken: string, videoTitles: string[]) {
  // Implement Spotify API call to search for songs
  // This is a placeholder implementation
  return videoTitles.map(title => ({ id: title, name: title, artist: 'Unknown' }))
}

async function createSpotifyPlaylist(accessToken: string, playlistName: string, trackUris: string[]) {
  // Implement Spotify API call to create a playlist
  // This is a placeholder implementation
  return { id: 'new-playlist-id', name: playlistName }
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [spotifySongs, setSpotifySongs] = useState<any[]>([])
  const [playlistName, setPlaylistName] = useState('')

  const { data: youtubeVideos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ['youtubeVideos'],
    queryFn: () => fetchFacebookYouTubeVideos(session?.accessToken as string),
    enabled: !!session?.accessToken,
  })

  const { mutate: searchSongs, isLoading: isSearchingSongs } = useMutation({
    mutationFn: (videoTitles: string[]) => searchSpotifySongs(session?.accessToken as string, videoTitles),
    onSuccess: (data) => setSpotifySongs(data),
  })

  const { mutate: createPlaylist, isLoading: isCreatingPlaylist } = useMutation({
    mutationFn: (name: string) => createSpotifyPlaylist(session?.accessToken as string, name, spotifySongs.map(song => song.id)),
    onSuccess: (data) => {
      alert(`Playlist "${data.name}" created successfully!`)
      setSpotifySongs([])
      setPlaylistName('')
    },
  })

  const handleRemoveSong = (id: string) => {
    setSpotifySongs(songs => songs.filter(song => song.id !== id))
  }

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
    </div>
  }

  if (status === "unauthenticated") {
    return <div className="flex justify-center items-center h-screen">
      Please sign in to access the dashboard.
    </div>
  }

  if (isLoadingVideos) {
    return <div className="flex justify-center items-center h-screen">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading videos...
    </div>
  }

  return (
    <div className="container mx-auto p-4 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      
      {youtubeVideos && youtubeVideos.length > 0 && (
        <Button 
          onClick={() => searchSongs(youtubeVideos.map(video => video.title))}
          disabled={isSearchingSongs}
          className="mb-4"
        >
          {isSearchingSongs ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching Songs
            </>
          ) : (
            'Search Spotify Songs'
          )}
        </Button>
      )}

      {spotifySongs.length > 0 && (
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2">Spotify Songs</h2>
          <ul className="space-y-2">
            {spotifySongs.map(song => (
              <li key={song.id} className="flex items-center justify-between bg-white bg-opacity-20 p-2 rounded">
                <span>{song.name} - {song.artist}</span>
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
          <Button 
            onClick={() => createPlaylist(playlistName)}
            disabled={isCreatingPlaylist || !playlistName}
          >
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
  )
}

