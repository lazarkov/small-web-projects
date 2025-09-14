import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Providers } from "./providers"
import { SEOHead } from "@/components/seo-head"
import { GoogleAnalytics } from "@/components/google-analytics"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata = {
  title: {
    default: "Spotmix - Create Spotify Playlists from Facebook Posts | Free Playlist Creator",
    template: "%s | Spotmix - Free Spotify Playlist Creator",
  },
  description:
    "Create Spotify playlists from your Facebook posts instantly! Free tool to convert Facebook shared YouTube videos into Spotify playlists. Automatic song matching, playlist generator, music discovery tool. No signup required.",
  keywords: [
    // Primary keywords
    "create spotify playlist",
    "spotify playlist creator",
    "spotify playlist generator",
    "make spotify playlist",
    "build spotify playlist",
    "spotify playlist maker",
    "free spotify playlist creator",
    "automatic spotify playlist",
    "spotify playlist tool",
    "spotify playlist builder",

    // Facebook integration
    "facebook to spotify",
    "facebook posts to spotify",
    "facebook music to spotify",
    "facebook shared videos to spotify",
    "facebook youtube to spotify",
    "social media to spotify",
    "facebook playlist creator",
    "convert facebook posts",

    // YouTube conversion
    "youtube to spotify",
    "youtube playlist to spotify",
    "convert youtube playlist",
    "youtube music to spotify",
    "youtube videos to spotify",
    "youtube converter spotify",
    "youtube to spotify converter",
    "youtube playlist converter",

    // Music discovery and tools
    "music playlist generator",
    "music discovery tool",
    "playlist from social media",
    "automatic music playlist",
    "music playlist maker",
    "song playlist creator",
    "music streaming playlist",
    "playlist automation",
    "music curation tool",
    "playlist organizer",

    // Specific use cases
    "spotmix",
    "spotmix converter",
    "spotmix playlist creator",
    "free music tools",
    "music playlist tools",
    "spotify tools",
    "music streaming tools",
    "playlist creation software",
    "music organization",
    "spotify automation",

    // Long-tail keywords
    "how to create spotify playlist",
    "how to make spotify playlist from facebook",
    "convert facebook videos to spotify",
    "turn facebook posts into playlist",
    "facebook music playlist creator",
    "social media music to spotify",
    "bulk spotify playlist creator",
    "mass spotify playlist generator",
    "spotify playlist from videos",
    "music playlist from social media",
  ].join(", "),
  authors: [{ name: "Spotmix - Free Spotify Playlist Creator" }],
  creator: "Spotmix Playlist Creator",
  publisher: "Spotmix Music Tools",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://youtubetospot.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Spotmix - Create Spotify Playlists from Facebook Posts | Free Playlist Creator",
    description:
      "Create Spotify playlists from your Facebook posts instantly! Free tool to convert Facebook shared YouTube videos into Spotify playlists. Automatic song matching, playlist generator, music discovery tool.",
    url: "https://youtubetospot.com",
    siteName: "Spotmix - Free Spotify Playlist Creator",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Spotmix - Create Spotify Playlists from Facebook Posts",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spotmix - Create Spotify Playlists from Facebook Posts | Free Playlist Creator",
    description:
      "Create Spotify playlists from your Facebook posts instantly! Free tool to convert Facebook shared YouTube videos into Spotify playlists. Automatic song matching, playlist generator.",
    images: ["/og-image.jpg"],
    creator: "@spotmixapp",
    site: "@spotmixapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  other: {
    "msapplication-TileColor": "#1DB954",
    "theme-color": "#1DB954",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <SEOHead />
      <body className={inter.className}>
        <Suspense fallback={null}>
          <GoogleAnalytics />
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  )
}
