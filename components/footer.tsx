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
          {/* Logo */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.059 14.406c-.192 0-.286-.093-.473-.187-1.41-.84-3.093-1.312-4.97-1.312-1.035 0-2.164.187-3.106.375-.187.093-.375.187-.562.187a.636.636 0 0 1-.652-.652c0-.375.187-.656.566-.75 1.219-.28 2.437-.468 3.848-.468 2.156 0 4.125.563 5.812 1.5.281.188.469.375.469.75-.094.375-.375.563-.75.563zm1.031-2.531c-.187 0-.375-.093-.562-.187-1.687-1.031-3.937-1.594-6.375-1.594-1.219 0-2.437.188-3.469.375-.187 0-.375.094-.562.094-.469 0-.844-.375-.844-.844 0-.469.281-.75.656-.844 1.219-.28 2.531-.469 4.219-.469 2.625 0 5.156.657 7.219 1.782.375.187.562.562.562.937 0 .47-.469.75-.844.75zm1.219-2.907c-.188 0-.282-.094-.563-.188-1.969-1.125-4.875-1.781-7.687-1.781-1.5 0-2.906.188-4.125.469-.188 0-.375.094-.656.094-.563.094-.938-.375-.938-.938 0-.562.281-.844.75-.938 1.5-.375 3-.562 4.969-.562 3.094 0 6.281.75 8.625 2.063.375.187.656.563.656 1.031 0 .563-.469.938-1.031.75z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-black">YouTube to Spotify</span>
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="space-y-3">
            <h4 className="font-semibold text-black">Newsroom</h4>
            <div className="space-y-2">
              <Link href="/policy" className="block text-black hover:underline transition-colors">
                Data Policy
              </Link>
              <Link href="/privacy-policy" className="block text-black hover:underline transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="block text-black hover:underline transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Links Column 2 */}
          <div className="space-y-3">
            <h4 className="font-semibold text-black">Instagram</h4>
            <div className="space-y-2">
              <span className="block text-black">Twitter</span>
            </div>
          </div>

          {/* Time Zone Info */}
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-mono text-black">SE GBG • STO</span>
                <span className="text-sm font-mono text-black font-bold">10:10:03</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-mono text-black">UK LDN</span>
                <span className="text-sm font-mono text-black font-bold">09:10:03</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-mono text-black">US NY • BOS</span>
                <span className="text-sm font-mono text-black font-bold">04:10:03</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-8 border-t border-black border-opacity-20">
          <div className="flex flex-wrap gap-6 text-sm text-black">
            <span>© 2025 YouTube to Spotify</span>
            <span>Legal</span>
            <span>Privacy</span>
            <span>Cookies</span>
            <span>Revoke access</span>
            <span>RSS</span>
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
