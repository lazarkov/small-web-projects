import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-4">
          <Link href="/policy" className="hover:underline">
            Data Policy
          </Link>
          <Link href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:underline">
            Terms of Service
          </Link>
        </div>
        <div className="text-center mt-2 text-sm">
          © {new Date().getFullYear()} YouTube to Spotify Playlist Creator. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

