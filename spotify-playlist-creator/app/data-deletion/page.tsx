"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, AlertTriangle, CheckCircle, Mail } from "lucide-react"

export default function DataDeletionPage() {
  const [isDeleted, setIsDeleted] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleDeleteData = () => {
    // Remove all localStorage data related to the app
    localStorage.removeItem("facebook_youtube_videos")
    localStorage.removeItem("spotify_songs")
    localStorage.removeItem("created_playlist_info")

    // Clear any other potential localStorage items
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (
        key &&
        (key.includes("spotmix") || key.includes("youtube") || key.includes("spotify") || key.includes("facebook"))
      ) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key))

    setIsDeleted(true)
    setShowConfirmation(false)
  }

  if (isDeleted) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 flex flex-col items-center justify-center p-4">
        <Card className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Data Deleted Successfully</h1>
            <p className="text-gray-600">
              All your local data has been removed from this browser. Your playlists on Spotify remain unchanged.
            </p>
          </div>

          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/">Return to Home</Link>
            </Button>
            <p className="text-xs text-gray-500">
              You can continue using Spotmix anytime by connecting your accounts again.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-red-400 via-pink-500 to-purple-500 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <Trash2 className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Data Deletion</h1>
          <p className="text-gray-600">Manage your data and account information for Spotmix Playlist Creator</p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">What Data Do We Store?</h2>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <p className="text-gray-700">
              <strong>Good news!</strong> Spotmix processes all data locally in your browser. We don't store any of your
              personal information, Facebook posts, or Spotify data on our servers.
            </p>
          </div>

          <div className="space-y-3 text-gray-700">
            <p>
              <strong>Local Browser Data:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Temporarily cached YouTube video titles from your Facebook posts</li>
              <li>Matched Spotify songs for playlist creation</li>
              <li>Created playlist information (ID, name, URL)</li>
              <li>Session tokens for Facebook and Spotify (automatically expire)</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Delete Your Data</h2>

          <div className="space-y-6">
            {/* Local Data Deletion */}
            <Card className="p-6 border-orange-200 bg-orange-50">
              <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                <Trash2 className="h-5 w-5 mr-2 text-orange-600" />
                Delete Local Browser Data
              </h3>
              <p className="text-gray-700 mb-4">
                Remove all Spotmix data stored in your browser's local storage. This includes cached videos, songs, and
                playlist information.
              </p>

              {!showConfirmation ? (
                <Button onClick={() => setShowConfirmation(true)} variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete My Local Data
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-red-800">Are you sure?</h4>
                        <p className="text-red-700 text-sm mt-1">
                          This will permanently delete all your cached data from this browser. Your Spotify playlists
                          will remain unchanged.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button onClick={handleDeleteData} variant="destructive" className="flex-1">
                      Yes, Delete My Data
                    </Button>
                    <Button onClick={() => setShowConfirmation(false)} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Account Deletion */}
            <Card className="p-6 border-gray-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                <Mail className="h-5 w-5 mr-2 text-gray-600" />
                Account & Service Deletion
              </h3>
              <p className="text-gray-700 mb-4">
                If you want to completely remove your account and request deletion of any associated data, please
                contact our support team.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Email us at:</strong>
                </p>
                <a
                  href="mailto:admin@spotmix.me?subject=Data Deletion Request - Spotmix"
                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  admin@spotmix.me
                </a>
                <p className="text-xs text-gray-500 mt-2">Please include "Data Deletion Request" in the subject line</p>
              </div>

              <Button asChild variant="outline" className="w-full bg-transparent">
                <a href="mailto:admin@spotmix.me?subject=Data Deletion Request - Spotmix">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </a>
              </Button>
            </Card>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">What Happens After Deletion?</h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <p>Your local browser data will be immediately removed</p>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <p>Your Spotify playlists will remain unchanged and accessible</p>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <p>You can use Spotmix again anytime by reconnecting your accounts</p>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <p>No personal information remains on our servers (we don't store any)</p>
            </div>
          </div>
        </section>

        <div className="text-center">
          <Button asChild variant="outline">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
