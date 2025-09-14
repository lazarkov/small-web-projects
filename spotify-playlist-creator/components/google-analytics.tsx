"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

// Replace with your actual Google Analytics Measurement ID
const GA_MEASUREMENT_ID = "G-XXXXXXXXXX"

export function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return

    // Load Google Analytics script
    const script1 = document.createElement("script")
    script1.async = true
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    document.head.appendChild(script1)

    const script2 = document.createElement("script")
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}', {
        page_title: document.title,
        page_location: window.location.href,
      });
    `
    document.head.appendChild(script2)

    return () => {
      document.head.removeChild(script1)
      document.head.removeChild(script2)
    }
  }, [])

  useEffect(() => {
    if (!window.gtag) return

    const url = pathname + searchParams.toString()
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }, [pathname, searchParams])

  return null
}

// Custom event tracking functions
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, parameters)
  }
}

// Predefined event tracking for common actions
export const trackPlaylistCreation = (playlistName: string, songCount: number, videoCount: number) => {
  trackEvent("playlist_created", {
    playlist_name: playlistName,
    song_count: songCount,
    video_count: videoCount,
    success_rate: Math.round((songCount / videoCount) * 100),
  })
}

export const trackFacebookConnect = () => {
  trackEvent("facebook_connected", {
    event_category: "authentication",
    event_label: "facebook_login",
  })
}

export const trackSpotifyConnect = () => {
  trackEvent("spotify_connected", {
    event_category: "authentication",
    event_label: "spotify_login",
  })
}

export const trackVideosFetched = (videoCount: number) => {
  trackEvent("videos_fetched", {
    event_category: "data_processing",
    video_count: videoCount,
  })
}

export const trackSongsMatched = (matchedCount: number, totalCount: number) => {
  trackEvent("songs_matched", {
    event_category: "data_processing",
    matched_count: matchedCount,
    total_count: totalCount,
    success_rate: Math.round((matchedCount / totalCount) * 100),
  })
}

export const trackPlaylistShared = (platform: string) => {
  trackEvent("playlist_shared", {
    event_category: "social_sharing",
    platform: platform,
  })
}

export const trackDonation = (amount: number) => {
  trackEvent("donation_made", {
    event_category: "monetization",
    value: amount,
    currency: "USD",
  })
}

export const trackDataDeletion = () => {
  trackEvent("data_deleted", {
    event_category: "privacy",
    event_label: "local_data_deletion",
  })
}
