import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Providers } from "./providers"
import { SEOHead } from "@/components/seo-head"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata = {
  title: {
    default: "YouTube to Spotify Playlist Creator - Convert Facebook Videos to Playlists",
    template: "%s | YouTube to Spotify Converter",
  },
  description:
    "Free tool to convert your Facebook shared YouTube videos into Spotify playlists instantly. Create playlists from your social media music shares with 90%+ accuracy matching.",
  keywords: [
    "youtube to spotify",
    "facebook to spotify",
    "playlist creator",
    "convert youtube playlist",
    "spotify playlist generator",
    "facebook music",
    "youtube music converter",
    "social media playlist",
    "music playlist tool",
    "spotify automation",
    "youtube converter",
    "facebook videos to spotify",
    "music discovery",
    "playlist maker",
    "spotify tools",
    "youtube playlist converter",
    "social music",
    "music streaming",
    "playlist generator free",
    "convert music playlist",
  ].join(", "),
  authors: [{ name: "YouTube to Spotify Converter" }],
  creator: "YouTube to Spotify Converter",
  publisher: "YouTube to Spotify Converter",
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
    title: "YouTube to Spotify Playlist Creator - Convert Facebook Videos to Playlists",
    description:
      "Free tool to convert your Facebook shared YouTube videos into Spotify playlists instantly. Create playlists from your social media music shares with 90%+ accuracy matching.",
    url: "https://youtubetospot.com",
    siteName: "YouTube to Spotify Playlist Creator",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "YouTube to Spotify Playlist Creator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube to Spotify Playlist Creator - Convert Facebook Videos to Playlists",
    description:
      "Free tool to convert your Facebook shared YouTube videos into Spotify playlists instantly. Create playlists from your social media music shares with 90%+ accuracy matching.",
    images: ["/og-image.jpg"],
    creator: "@youtubetospot",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
