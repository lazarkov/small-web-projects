import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-black bg-opacity-50 backdrop-blur-sm text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-8">
          <Link href="/policy" className="hover:underline text-gray-300 hover:text-white transition-colors">
            Data Policy
          </Link>
          <Link href="/privacy-policy" className="hover:underline text-gray-300 hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:underline text-gray-300 hover:text-white transition-colors">
            Terms of Service
          </Link>
        </div>
        <div className="text-center mt-4 text-sm text-gray-400">
          © {new Date().getFullYear()} YouTube to Spotify Playlist Creator. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
