"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Facebook, Twitter, Linkedin, Copy, Check, X, Share2 } from "lucide-react"

interface SharePopupProps {
  playlistId: string
  playlistName: string
  onClose: () => void
}

export function SharePopup({ playlistId, playlistName, onClose }: SharePopupProps) {
  const [copied, setCopied] = useState(false)

  const playlistUrl = `https://open.spotify.com/playlist/${playlistId}`
  const shareMessage = `Check out my playlist "${playlistName}" that I created with Spotmix!`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(playlistUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(playlistUrl)}`, "_blank")
  }

  const handleShareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(playlistUrl)}`,
      "_blank",
    )
  }

  const handleShareLinkedin = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(playlistUrl)}`, "_blank")
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
      <Card className="w-full max-w-md bg-gradient-to-r from-purple-900 to-pink-800 text-white border-none">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex items-center">
              <Share2 className="mr-2 h-5 w-5" /> Share Your Playlist
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="mb-6">
            <p className="mb-4">
              Your playlist "{playlistName}" has been created successfully! Share it with your friends:
            </p>

            <div className="flex mb-4">
              <Input value={playlistUrl} readOnly className="bg-white bg-opacity-10 border-gray-700 text-white" />
              <Button onClick={handleCopyLink} className="ml-2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex justify-center space-x-4">
              <Button onClick={handleShareFacebook} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button onClick={handleShareTwitter} className="bg-sky-500 hover:bg-sky-600 text-white">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button onClick={handleShareLinkedin} className="bg-blue-700 hover:bg-blue-800 text-white">
                <Linkedin className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={() => window.open(playlistUrl, "_blank")}
              className="bg-green-600 hover:bg-green-700 text-white w-full"
            >
              <Spotify className="mr-2 h-5 w-5" /> Open in Spotify
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

function Spotify({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      width="24"
      height="24"
    >
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.059 14.406c-.192 0-.286-.093-.473-.187-1.41-.84-3.093-1.312-4.97-1.312-1.035 0-2.164.187-3.106.375-.187.093-.375.187-.562.187a.636.636 0 0 1-.652-.652c0-.375.187-.656.566-.75 1.219-.28 2.437-.468 3.848-.468 2.156 0 4.125.563 5.812 1.5.281.188.469.375.469.75-.094.375-.469.563-.75.563zm1.031-2.531c-.187 0-.375-.093-.562-.187-1.687-1.031-3.937-1.594-6.375-1.594-1.219 0-2.437.188-3.469.375-.187 0-.375.094-.562.094-.469 0-.844-.375-.844-.844 0-.469.281-.75.656-.844 1.219-.28 2.531-.469 4.219-.469 2.625 0 5.156.657 7.219 1.782.375.187.562.562.562.937 0 .47-.469.75-.844.75zm1.219-2.907c-.188 0-.282-.094-.563-.188-1.969-1.125-4.875-1.781-7.687-1.781-1.5 0-2.906.188-4.125.469-.188 0-.375.094-.656.094-.563.094-.938-.375-.938-.938 0-.562.281-.75.75-.938 1.5-.375 3-.562 4.969-.562 3.094 0 6.281.75 8.625 2.063.375.187.656.563.656 1.031 0 .563-.469.938-1.031.75z" />
    </svg>
  )
}
