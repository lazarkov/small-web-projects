'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Trash2, Music, LogIn, RefreshCw } from 'lucide-react'
import { ProgressTracker } from '@/components/progress-tracker'

type Step = {
  title: string
  description: string
  status: 'pending' | 'loading' | 'completed'
}

type Video = {
  id: string
  title: string
}

const STORAGE_KEY = 'facebook_youtube_videos';

async function fetchFacebookYouTubeVideos(accessToken: string): Promise<Video[]> {
  let allVideos: Video[] = [];
  let nextPageUrl = `https://graph.facebook.com/v12.0/me/feed?fields=attachments{title,url}&limit=200`;

  while (nextPageUrl) {
    const response = await fetch(nextPageUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const data = await response.json();

    const youtubeVideos = data.data
      .filter((post: any) => post.attachments && post.attachments.data[0].url && post.attachments.data[0].url.includes('youtube.com'))
      .map((post: any) => ({
        id: post.id,
        title: post.attachments.data[0].title
      }));

    allVideos = [...allVideos, ...youtubeVideos];

    if (data.paging && data.paging.next) {
      nextPageUrl = data.paging.next;
    } else {
      nextPageUrl = '';
    }
  }

  console.log('Total YouTube videos found:', allVideos.length);
  return allVideos;
}

async function searchSpotifySongs(accessToken: string, videoTitles: string[]) {
  const songs = await Promise.all(videoTitles.map(async (title) => {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(title)}&type=track&limit=1`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const data = await response.json();
    if (data.tracks.items.length > 0) {
      const track = data.tracks.items[0];
      return {
        id: track.id,
        name: track.name,
        artist: track.artists[0].name
      };
    }
    return null;
  }));

  const validSongs = songs.filter(song => song !== null);
  console.log('Spotify songs found:', validSongs);
  return validSongs;
}

async function createSpotifyPlaylist(accessToken: string, playlistName: string, trackUris: string[]) {
  // Implement Spotify API call to create a playlist
  await new Promise(resolve => setTimeout(resolve, 2000)) // Simulated delay
  return { id: 'new-playlist-id', name: playlistName }
}

export default function Home() {
  const { data: session, status } = useSession()
  const [spotifySongs, setSpotifySongs] = useState<any[]>([])
  const [playlistName, setPlaylistName] = useState('')
  const [currentProgress, setCurrentProgress] = useState(0)

  const steps: Step[] = [
    {
      title: 'Connect Facebook',
      description: 'Sign in with your Facebook account',
      status: 'pending'
    },
    {
      title: 'Fetch Videos',
      description: 'Getting your shared YouTube videos from Facebook',
      status: 'pending'
    },
    {
      title: 'Connect Spotify',
      description: 'Link your Spotify account',
      status: 'pending'
    },
    {
      title: 'Create Playlist',
      description: 'Finding songs on Spotify and creating your playlist',
      status: 'pending'
    }
  ]

  const [currentSteps, setCurrentSteps] = useState(steps)

  useEffect(() => {
    if (session?.provider === 'facebook') {
      setCurrentProgress(25)
      setCurrentSteps(prev => {
        const newSteps = [...prev]
        newSteps[0].status = 'completed'
        return newSteps
      })
    }
  }, [session])

  const {
    data: youtubeVideos,
    isLoading: isLoadingVideos,
    isError: isErrorVideos,
    error: errorVideos,
    refetch: refetchVideos
  } = useQuery({
    queryKey: ['youtubeVideos'],
    queryFn: async () => {
      try {
        setCurrentSteps(prev => {
          const newSteps = [...prev];
          newSteps[1].status = 'loading';
          return newSteps;
        });

        const storedVideos = localStorage.getItem(STORAGE_KEY);
        if (storedVideos) {
          return JSON.parse(storedVideos);
        }

        const videos = await fetchFacebookYouTubeVideos(session?.accessToken as string);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
        return videos;
      } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        throw error;
      }
    },
    enabled: false,
    onSuccess: (data) => {
      console.log('Data fetched successfully:', data);
      setCurrentSteps(prev => {
        const newSteps = [...prev];
        newSteps[1].status = 'completed';
        return newSteps;
      });
      setCurrentProgress(50);
    },
    onError: (error) => {
      console.error('Error in YouTube videos query:', error);
      setCurrentSteps(prev => {
        const newSteps = [...prev];
        newSteps[1].status = 'pending';
        return newSteps;
      });
      // Optionally, you can show an error message to the user here
    }
  });

  const { mutate: searchSongs, isLoading: isSearchingSongs } = useMutation({
    mutationFn: (videoTitles: string[]) => searchSpotifySongs(session?.accessToken as string, videoTitles),
    onSuccess: (data) => setSpotifySongs(data),
  })

  const { mutate: createPlaylist, isLoading: isCreatingPlaylist } = useMutation({
    mutationFn: (name: string) => {
      setCurrentSteps(prev => {
        const newSteps = [...prev]
        newSteps[3].status = 'loading'
        return newSteps
      })
      return createSpotifyPlaylist(session?.accessToken as string, name, spotifySongs.map(song => song.id))
    },
    onSuccess: (data) => {
      setCurrentSteps(prev => {
        const newSteps = [...prev]
        newSteps[3].status = 'completed'
        return newSteps
      })
      setCurrentProgress(100)
      alert(`Playlist "${data.name}" created successfully!`)
      setSpotifySongs([])
      setPlaylistName('')
    },
  })

  const handleRemoveSong = (id: string) => {
    setSpotifySongs(songs => songs.filter(song => song.id !== id))
  }

  const handleFetchVideos = useCallback(async () => {
    if (session?.provider === 'facebook') {
      try {
        localStorage.removeItem(STORAGE_KEY);
        await refetchVideos();
      } catch (error) {
        console.error('Error fetching videos:', error);
        // Optionally, you can show an error message to the user here
      }
    }
  }, [session, refetchVideos]);

  const handleSpotifyConnect = () => {
    signIn('spotify')
  }

  const handleInitiatePlaylistCreation = useCallback(() => {
    if (youtubeVideos && youtubeVideos.length > 0) {
      searchSongs(youtubeVideos.map(video => video.title));
    }
  }, [youtubeVideos, searchSongs]);

  useEffect(() => {
    if (session?.provider === 'spotify' && youtubeVideos) {
      setCurrentSteps(prev => {
        const newSteps = [...prev];
        newSteps[2].status = 'completed';
        return newSteps;
      });
      setCurrentProgress(75);
    }
  }, [session, youtubeVideos]);

  useEffect(() => {
    const storedVideos = localStorage.getItem(STORAGE_KEY);
    if (storedVideos) {
      const parsedVideos = JSON.parse(storedVideos);
      setCurrentSteps(prev => {
        const newSteps = [...prev];
        newSteps[1].status = 'completed';
        return newSteps;
      });
      setCurrentProgress(50);
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          YouTube to Spotify Playlist Creator
        </h1>
        <p className="text-center text-white mb-8">
          Turn your Facebook-shared YouTube videos into a Spotify playlist in just a few clicks!
        </p>
        
        <ProgressTracker steps={currentSteps} currentProgress={currentProgress} />
        
        <div className="mt-8 space-y-4">
          {!session && (
            <Button className="w-full" onClick={() => signIn('facebook')}>
              <LogIn className="mr-2 h-4 w-4" /> Sign In with Facebook
            </Button>
          )}
          
          {session?.provider === 'facebook' && (
            <div className="flex space-x-2">
              <Button 
                className="flex-grow"
                onClick={handleFetchVideos}
                disabled={isLoadingVideos}
              >
                {isLoadingVideos ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching Videos
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" /> {youtubeVideos ? 'Refresh' : 'Fetch'} YouTube Videos
                  </>
                )}
              </Button>
              {currentSteps[2].status !== 'completed' && session?.provider === 'facebook' && (
                <Button onClick={handleSpotifyConnect}>
                  <LogIn className="mr-2 h-4 w-4" /> Connect Spotify
                </Button>
              )}
              {currentSteps[2].status === 'completed' && !spotifySongs.length && (
                <Button onClick={handleInitiatePlaylistCreation} disabled={isSearchingSongs}>
                  {isSearchingSongs ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching Songs
                    </>
                  ) : (
                    <>
                      <Music className="mr-2 h-4 w-4" /> Create Playlist
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
          {isErrorVideos && (
            <div className="text-red-500 mt-2">
              Error fetching videos. Please try again.
            </div>
          )}

          {spotifySongs.length > 0 && (
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2 text-white">Spotify Songs</h2>
              <ul className="space-y-2">
                {spotifySongs.map(song => (
                  <li key={song.id} className="flex items-center justify-between bg-white bg-opacity-20 p-2 rounded">
                    <span className="text-white">{song.name} - {song.artist}</span>
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

          {session && (
            <Button className="w-full" onClick={() => signOut()}>
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}

