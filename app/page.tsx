'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Trash2, Music, LogIn, RefreshCw, CheckCircle, X } from 'lucide-react'
import { ProgressTracker } from '@/components/progress-tracker'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"

type Step = {
  title: string
  description: string
  status: 'pending' | 'loading' | 'completed'
}

type Video = {
  id: string
  title: string
}

type Song = {
  id: string
  name: string
  artist: string
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

async function searchSpotifySongs(
  accessToken: string, 
  videoTitles: string[], 
  onProgress: (current: number, total: number) => void
): Promise<Song[]> {
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const songs: Song[] = [];

  for (let i = 0; i < videoTitles.length; i++) {
    const title = videoTitles[i];
    try {
      await delay(200); // Minimal delay between searches
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(title)}&type=track&limit=1`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.status === 429) {
        console.log('Rate limit reached. Pausing for 5 seconds...');
        await delay(5000); // Pause for 5 seconds when rate limit is hit
        i--; // Retry this iteration
        continue;
      }
      
      const data = await response.json();
      if (data.tracks.items.length > 0) {
        const track = data.tracks.items[0];
        songs.push({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name
        });
      }
    } catch (error) {
      console.error(`Error searching for "${title}":`, error);
    }
    onProgress(i + 1, videoTitles.length);
  }

  console.log('Spotify songs found:', songs);
  return songs;
}

async function createSpotifyPlaylist(accessToken: string, playlistName: string, trackUris: string[]) {
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  try {
    // Step 1: Get the user's Spotify ID
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (!userResponse.ok) throw new Error('Failed to fetch user data');
    const userData = await userResponse.json();
    const userId = userData.id;

    // Step 2: Create a new playlist
    const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: playlistName,
        description: 'Created with YouTube to Spotify Playlist Creator',
        public: false
      })
    });
    if (!createPlaylistResponse.ok) throw new Error('Failed to create playlist');
    const playlistData = await createPlaylistResponse.json();

    // Step 3: Add tracks to the playlist (in batches of 100 due to API limitations)
    const batchSize = 100;
    for (let i = 0; i < trackUris.length; i += batchSize) {
      const batch = trackUris.slice(i, i + batchSize);
      const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: batch
        })
      });
      if (!addTracksResponse.ok) throw new Error('Failed to add tracks to playlist');
      
      // Add a small delay between batches to avoid rate limiting
      await delay(1000);
    }

    return { id: playlistData.id, name: playlistData.name };
  } catch (error) {
    console.error('Error creating Spotify playlist:', error);
    throw error;
  }
}

export default function Home() {
  const { data: session, status } = useSession()
  const [youtubeVideos, setYoutubeVideos] = useState<Video[]>([])
  const [spotifySongs, setSpotifySongs] = useState<Song[]>([])
  const [playlistName, setPlaylistName] = useState('')
  const [currentProgress, setCurrentProgress] = useState(0)
  const [searchProgress, setSearchProgress] = useState({ current: 0, total: 0 })

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
    isLoading: isLoadingVideos,
    isError: isErrorVideos,
    error: errorVideos,
    refetch: refetchVideos,
    isFetching: isFetchingVideos
  } = useQuery({
    queryKey: ['youtubeVideos'],
    queryFn: async () => {
      try {
        setCurrentSteps(prev => {
          const newSteps = [...prev];
          newSteps[1].status = 'loading';
          return newSteps;
        });

        const videos = await fetchFacebookYouTubeVideos(session?.accessToken as string);
        setYoutubeVideos(videos);
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
    }
  });

  const { mutate: searchSongs, isLoading: isSearchingSongs, error: searchError } = useMutation({
    mutationFn: (videoTitles: string[]) => {
      setSearchProgress({ current: 0, total: videoTitles.length });
      return searchSpotifySongs(
        session?.accessToken as string, 
        videoTitles,
        (current, total) => setSearchProgress({ current, total })
      );
    },
    onSuccess: (data) => {
      setSpotifySongs(data);
      setCurrentSteps(prev => {
        const newSteps = [...prev];
        newSteps[3].status = 'completed';
        return newSteps;
      });
      setCurrentProgress(75);
    },
    onError: (error) => {
      console.error('Error searching songs:', error);
      setCurrentSteps(prev => {
        const newSteps = [...prev];
        newSteps[3].status = 'pending';
        return newSteps;
      });
    },
  });

  const { mutate: createPlaylist, isLoading: isCreatingPlaylist, error: createPlaylistError } = useMutation({
    mutationFn: (name: string) => {
      setCurrentSteps(prev => {
        const newSteps = [...prev]
        newSteps[3].status = 'loading'
        return newSteps
      })
      return createSpotifyPlaylist(
        session?.accessToken as string,
        name,
        spotifySongs.map(song => `spotify:track:${song.id}`)
      )
    },
    onSuccess: (data) => {
      setCurrentSteps(prev => {
        const newSteps = [...prev]
        newSteps[3].status = 'completed'
        return newSteps
      })
      setCurrentProgress(100)
      alert(`Playlist "${data.name}" created successfully with ${spotifySongs.length} songs!`)
      setSpotifySongs([])
      setPlaylistName('')
    },
    onError: (error) => {
      console.error('Error creating playlist:', error)
      setCurrentSteps(prev => {
        const newSteps = [...prev]
        newSteps[3].status = 'pending'
        return newSteps
      })
      alert('Failed to create playlist. Please try again.')
    }
  })

  const handleRemoveVideo = (id: string) => {
    setYoutubeVideos(videos => videos.filter(video => video.id !== id))
  }

  const handleRemoveSong = (id: string) => {
    setSpotifySongs(songs => songs.filter(song => song.id !== id))
  }

  const handleFetchVideos = useCallback(async () => {
    if (session?.provider === 'facebook') {
      try {
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
    if (youtubeVideos.length > 0) {
      searchSongs(youtubeVideos.map(video => video.title));
    } else {
      console.log('No YouTube videos found');
      // Optionally, you can show a message to the user here
    }
  }, [searchSongs, youtubeVideos]);

  useEffect(() => {
    if (session?.provider === 'spotify') {
      setCurrentSteps(prev => {
        const newSteps = [...prev];
        newSteps[0].status = 'completed'; // Ensure Facebook step remains completed
        newSteps[2].status = 'completed';
        return newSteps;
      });
      setCurrentProgress(75);
    }
  }, [session]);

  useEffect(() => {
    const storedVideos = localStorage.getItem(STORAGE_KEY);
    if (storedVideos) {
      const parsedVideos = JSON.parse(storedVideos);
      setYoutubeVideos(parsedVideos);
      setCurrentSteps(prev => {
        const newSteps = [...prev];
        newSteps[0].status = 'completed'; // Ensure Facebook step remains completed
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
                disabled={isFetchingVideos}
              >
                {isFetchingVideos ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching Videos
                  </>
                ) : youtubeVideos.length > 0 ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Videos Fetched
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" /> Fetch YouTube Videos
                  </>
                )}
              </Button>
              {currentSteps[2].status !== 'completed' && (
                <Button onClick={handleSpotifyConnect}>
                  <LogIn className="mr-2 h-4 w-4" /> Connect Spotify
                </Button>
              )}
            </div>
          )}

          {youtubeVideos.length > 0 && (
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2 text-white">YouTube Videos</h2>
              <ScrollArea className="h-[50vh] border rounded-md border-gray-700">
                <ul className="space-y-2 p-4">
                  {youtubeVideos.map(video => (
                    <li key={video.id} className="flex items-center justify-between bg-white bg-opacity-20 p-2 rounded">
                      <span className="text-white">{video.title}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveVideo(video.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}

          {session?.provider === 'spotify' && youtubeVideos.length > 0 && !spotifySongs.length && (
            <div className="space-y-2">
              <Button 
                onClick={handleInitiatePlaylistCreation} 
                disabled={isSearchingSongs} 
                className="w-full relative"
              >
                {isSearchingSongs ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching Songs
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
                      <div className="text-white text-sm">
                        {searchProgress.current} / {searchProgress.total} songs found
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Music className="mr-2 h-4 w-4" /> Find Spotify Songs
                  </>
                )}
              </Button>
              {isSearchingSongs && (
                <Progress value={(searchProgress.current / searchProgress.total) * 100} className="w-full" />
              )}
              {searchError && (
                <p className="text-red-500 text-sm">
                  An error occurred while searching for songs. Some songs may not have been found.
                </p>
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
              <ScrollArea className="h-[50vh] border rounded-md border-gray-700">
                <ul className="space-y-2 p-4">
                  {spotifySongs.map(song => (
                    <li key={song.id} className="flex items-center justify-between bg-white bg-opacity-20 p-2 rounded">
                      <span className="text-white">{song.name} - {song.artist}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveSong(song.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}

          {spotifySongs.length > 0 && (
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter playlist name"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                className="w-full"
              />
              <Button 
                onClick={() => createPlaylist(playlistName)}
                disabled={isCreatingPlaylist || !playlistName}
                className="w-full"
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
            <div className="space-y-2">
              {session.provider === 'facebook' && (
                <Button className="w-full" onClick={() => signOut({ callbackUrl: '/' })}>
                  <LogIn className="mr-2 h-4 w-4" /> Sign Out from Facebook
                </Button>
              )}
              {session.provider === 'spotify' && (
                <Button className="w-full" onClick={() => signOut({ callbackUrl: '/' })}>
                  <LogIn className="mr-2 h-4 w-4" /> Sign Out from Spotify
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

