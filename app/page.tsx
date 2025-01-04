import { getServerSession } from "next-auth/next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogIn } from 'lucide-react'
import { authOptions } from "./api/auth/[...nextauth]/route"

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Spotify Playlist Creator
        </h1>
        {session ? (
          <Link href="/dashboard">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
        ) : (
          <Link href="/api/auth/signin">
            <Button className="w-full">
              <LogIn className="mr-2 h-4 w-4" /> Sign In
            </Button>
          </Link>
        )}
      </div>
    </main>
  )
}

