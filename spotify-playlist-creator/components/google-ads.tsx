"use client"

import { useEffect } from "react"

interface GoogleAdsProps {
  adSlot: string
  adFormat?: string
  fullWidthResponsive?: boolean
  className?: string
}

export function GoogleAds({ adSlot, adFormat = "auto", fullWidthResponsive = true, className = "" }: GoogleAdsProps) {
  useEffect(() => {
    try {
      // Load Google AdSense script if not already loaded
      if (!window.adsbygoogle) {
        const script = document.createElement("script")
        script.async = true
        script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"
        script.crossOrigin = "anonymous"
        document.head.appendChild(script)
      }
      // Push the ad
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (error) {
      console.error("Google Ads error:", error)
    }
  }, [])

  return (
    <div className={`google-ads-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  )
}

// Extend window type for TypeScript
declare global {
  interface Window {
    adsbygoogle: any[]
  }
}
