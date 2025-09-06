import Link from "next/link"

export function Footer() {
  return (
    <footer className="relative mt-16 py-12 px-4 lg:px-8 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 right-20 w-32 h-32 bg-pink-400 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 left-20 w-48 h-48 bg-pink-300 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-pink-500 rounded-full blur-lg"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.059 14.406c-.192 0-.286-.093-.473-.187-1.41-.84-3.093-1.312-4.97-1.312-1.035 0-2.164.187-3.106.375-.187.093-.375.187-.562.187a.636.636 0 0 1-.652-.652c0-.375.187-.656.566-.75 1.219-.28 2.437-.468 3.848-.468 2.156 0 4.125.563 5.812 1.5.281.188.469.375.469.75-.094.375-.375.563-.75.563zm1.031-2.531c-.187 0-.375-.093-.562-.187-1.687-1.031-3.937-1.594-6.375-1.594-1.219 0-2.437.188-3.469.375-.187 0-.375.094-.562.094-.469 0-.844-.375-.844-.844 0-.469.281-.75.656-.844 1.219-.28 2.531-.469 4.219-.469 2.625 0 5.156.657 7.219 1.782.375.187.562.562.562.937 0 .47-.469.75-.844.75zm1.219-2.907c-.188 0-.282-.094-.563-.188-1.969-1.125-4.875-1.781-7.687-1.781-1.5 0-2.906.188-4.125.469-.188 0-.375.094-.656.094-.563.094-.938-.375-.938-.938 0-.562.281-.844.75-.938 1.5-.375 3-.562 4.969-.562 3.094 0 6.281.75 8.625 2.063.375.187.656.563.656 1.031 0 .563-.469.938-1.031.75z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-black">Spotmix</span>
            </div>
            <p className="text-sm text-black opacity-80 max-w-md">
              The #1 free tool to convert your Facebook shared YouTube videos into Spotify playlists. Create unlimited
              playlists with 90%+ accuracy matching. No data stored, completely private.
            </p>
            <div className="flex space-x-4 text-sm text-black opacity-70">
              <span>🎵 90%+ Accuracy</span>
              <span>🔒 Privacy First</span>
              <span>⚡ Instant Results</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-black">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-black hover:underline transition-colors text-sm">
                Home
              </Link>
              <Link href="/dashboard" className="block text-black hover:underline transition-colors text-sm">
                Dashboard
              </Link>
              <Link href="#faq" className="block text-black hover:underline transition-colors text-sm">
                FAQ
              </Link>
            </div>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-black">Legal</h4>
            <div className="space-y-2">
              <Link href="/policy" className="block text-black hover:underline transition-colors text-sm">
                Data Policy
              </Link>
              <Link href="/privacy-policy" className="block text-black hover:underline transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="block text-black hover:underline transition-colors text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Keywords for SEO */}
        <div className="mt-8 pt-4 border-t border-black border-opacity-20">
          <div className="text-xs text-black opacity-60 text-center">
            <p className="mb-2">
              <strong>Popular searches:</strong> Spotmix converter, facebook music to spotify, playlist creator, convert
              youtube playlist, spotify playlist generator, social media music, youtube music converter, facebook videos
              to spotify, music discovery tool, playlist maker
            </p>
          </div>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-8 border-t border-black border-opacity-20">
          <div className="flex flex-wrap gap-6 text-sm text-black">
            <span>© 2025 Spotmix Playlist Creator</span>
            <span>Made with ❤️ for music lovers</span>
          </div>

          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <span className="text-sm font-semibold text-black tracking-wider uppercase">Back to Top</span>
            <svg className="h-4 w-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        </div>
      </div>
    </footer>
  )
}
