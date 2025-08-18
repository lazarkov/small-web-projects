import Head from "next/head"

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string
  canonicalUrl?: string
  ogImage?: string
  structuredData?: object
}

export function SEOHead({
  title = "YouTube to Spotify Playlist Creator - Convert Facebook Shared Videos to Spotify Playlists",
  description = "Free tool to convert your Facebook shared YouTube videos into Spotify playlists instantly. Create playlists from your social media music shares with 90%+ accuracy matching.",
  keywords = "youtube to spotify, facebook to spotify, playlist creator, convert youtube playlist, spotify playlist generator, facebook music, youtube music converter, social media playlist, music playlist tool, spotify automation, youtube converter, facebook videos to spotify, music discovery, playlist maker, spotify tools, youtube playlist converter, social music, music streaming, playlist generator free, convert music playlist",
  canonicalUrl = "https://youtubetospot.com",
  ogImage = "/og-image.jpg",
  structuredData,
}: SEOHeadProps) {
  const jsonLd = structuredData || {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "YouTube to Spotify Playlist Creator",
    description: description,
    url: canonicalUrl,
    applicationCategory: "MusicApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: "YouTube to Spotify Converter",
      url: canonicalUrl,
    },
    featureList: [
      "Convert Facebook shared YouTube videos to Spotify playlists",
      "Automatic song matching with 90%+ accuracy",
      "Free playlist creation",
      "Social media music discovery",
      "Batch playlist generation",
    ],
  }

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="language" content="English" />
      <meta name="author" content="YouTube to Spotify Converter" />
      <meta name="copyright" content="YouTube to Spotify Converter" />
      <meta name="rating" content="General" />
      <meta name="distribution" content="Global" />
      <meta name="revisit-after" content="1 days" />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="YouTube to Spotify Playlist Creator" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      <meta property="twitter:creator" content="@youtubetospot" />
      <meta property="twitter:site" content="@youtubetospot" />

      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#1DB954" />
      <meta name="msapplication-TileColor" content="#1DB954" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="YouTube to Spotify" />
      <meta name="application-name" content="YouTube to Spotify" />
      <meta name="mobile-web-app-capable" content="yes" />

      {/* Geo Tags */}
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />

      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://accounts.spotify.com" />
      <link rel="preconnect" href="https://api.spotify.com" />
      <link rel="preconnect" href="https://graph.facebook.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
    </Head>
  )
}
