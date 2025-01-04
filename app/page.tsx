import { getServerSession } from "next-auth/next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogIn } from 'lucide-react'
import { authOptions } from "./api/auth/[...nextauth]/route"
import { ProgressTracker } from '@/components/progress-tracker'

export default async function Home() {
  const session = await getServerSession(authOptions)

  const steps = [
    {
      title: 'Connect Facebook',
      description: 'Sign in with your Facebook account',
      status: session ? 'completed' : 'pending'
    },
    {
      title: 'Connect Spotify',
      description: 'Link your Spotify account',
      status: 'pending'
    },
    {
      title: 'Fetch Videos',
      description: 'We\'ll get your shared YouTube videos',
      status: 'pending'
    },
    {
      title: 'Create Playlist',
      description: 'Create a Spotify playlist from your videos',
      status: 'pending'
    }
  ]

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          YouTube to Spotify Playlist Creator
        </h1>
        <p className="text-center text-white mb-8">
          Turn your Facebook-shared YouTube videos into a Spotify playlist in just a few clicks!
        </p>
        
        <ProgressTracker steps={steps} currentProgress={session ? 25 : 0} />
        
        <div className="mt-8">
          {session ? (
            <Link href="/dashboard">
              <Button className="w-full">Continue to Dashboard</Button>
            </Link>
          ) : (
            <Link href="/api/auth/signin/facebook">
              <Button className="w-full">
                <LogIn className="mr-2 h-4 w-4" /> Sign In with Facebook
              </Button>
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}

