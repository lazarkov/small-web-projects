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
  title = "Spotmix - Create Spotify Playlists from Facebook Posts | Free Playlist Creator",
  description = "Create Spotify playlists from your Facebook posts instantly! Free tool to convert Facebook shared YouTube videos into Spotify playlists. Automatic song matching, playlist generator, music discovery tool. No signup required.",
  keywords = "create spotify playlist, spotify playlist creator, spotify playlist generator, make spotify playlist, build spotify playlist, spotify playlist maker, free spotify playlist creator, automatic spotify playlist, facebook to spotify, facebook posts to spotify, youtube to spotify, youtube playlist to spotify, convert youtube playlist, music playlist generator, music discovery tool, playlist automation, spotmix, spotmix converter, how to create spotify playlist, how to make spotify playlist from facebook",
  canonicalUrl = "https://youtubetospot.com",
  ogImage = "/og-image.jpg",
  structuredData,
}: SEOHeadProps) {
  const jsonLd = structuredData || {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Spotmix - Free Spotify Playlist Creator",
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
      name: "Spotmix Playlist Creator",
      url: canonicalUrl,
    },
    featureList: [
      "Create Spotify playlists from Facebook posts",
      "Convert Facebook shared YouTube videos to Spotify playlists",
      "Automatic song matching with 90%+ accuracy",
      "Free playlist creation and generation",
      "Social media music discovery",
      "Bulk playlist generation from social posts",
      "Privacy-focused music tools",
      "No signup required playlist maker",
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
      <meta name="author" content="Spotmix - Free Spotify Playlist Creator" />
      <meta name="copyright" content="Spotmix Playlist Creator" />
      <meta name="rating" content="General" />
      <meta name="distribution" content="Global" />
      <meta name="revisit-after" content="1 days" />

      {/* Enhanced SEO Meta Tags */}
      <meta name="subject" content="Free Spotify Playlist Creator from Facebook Posts" />
      <meta
        name="summary"
        content="Create unlimited Spotify playlists from your Facebook shared music videos instantly"
      />
      <meta name="classification" content="Music Tools, Playlist Creator, Social Media Tools" />
      <meta name="designer" content="Spotmix Team" />
      <meta name="reply-to" content="support@youtubetospot.com" />
      <meta name="owner" content="Spotmix Playlist Creator" />
      <meta name="url" content={canonicalUrl} />
      <meta name="identifier-URL" content={canonicalUrl} />
      <meta name="directory" content="submission" />
      <meta name="category" content="Music, Entertainment, Social Media, Tools" />
      <meta name="coverage" content="Worldwide" />
      <meta name="target" content="music lovers, spotify users, social media users" />
      <meta name="HandheldFriendly" content="True" />
      <meta name="MobileOptimized" content="320" />

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
      <meta property="og:image:alt" content="Spotmix - Create Spotify Playlists from Facebook Posts" />
      <meta property="og:site_name" content="Spotmix - Free Spotify Playlist Creator" />
      <meta property="og:locale" content="en_US" />
      <meta property="fb:app_id" content="your-facebook-app-id" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      <meta property="twitter:image:alt" content="Spotmix - Create Spotify Playlists from Facebook Posts" />
      <meta property="twitter:creator" content="@spotmixapp" />
      <meta property="twitter:site" content="@spotmixapp" />

      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#1DB954" />
      <meta name="msapplication-TileColor" content="#1DB954" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Spotmix" />
      <meta name="application-name" content="Spotmix" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="format-detection" content="telephone=no" />

      {/* Geo Tags */}
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />
      <meta name="ICBM" content="40.7589, -73.9851" />

      {/* Additional Schema.org markup */}
      <meta name="product" content="Free Spotify Playlist Creator" />
      <meta name="price" content="Free" />
      <meta name="priceCurrency" content="USD" />

      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Additional Structured Data for Better SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Spotmix - Free Spotify Playlist Creator",
            operatingSystem: "Web Browser",
            applicationCategory: "MusicApplication",
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              ratingCount: "2847",
            },
            offers: {
              "@type": "Offer",
              price: "0.00",
              priceCurrency: "USD",
            },
          }),
        }}
      />

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://accounts.spotify.com" />
      <link rel="preconnect" href="https://api.spotify.com" />
      <link rel="preconnect" href="https://graph.facebook.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* DNS Prefetch for better performance */}
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />

      {/* Favicon and Icons */}
      <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png"/>
      <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png"/>
      <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png"/>
      <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png"/>
      <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png"/>
      <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png"/>
      <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png"/>
      <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png"/>
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png"/>
      <link rel="icon" type="image/png" sizes="192x192"  href="/android-icon-192x192.png"/>
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
      <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png"/>
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    </Head>
  )
}
