"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

const faqs = [
  {
    question: "How do I create a Spotify playlist from my Facebook posts?",
    answer:
      "Simply connect your Facebook account, and our tool will automatically scan your posts for YouTube video shares. Then connect Spotify, and we'll create a playlist with matching songs found on Spotify. It's completely free and takes just a few minutes!",
  },
  {
    question: "Is the Spotmix playlist creator really free?",
    answer:
      "Yes! Our Spotmix converter is completely free to use. You can create unlimited Spotify playlists from your Facebook shared YouTube videos without any cost, signup, or subscription required.",
  },
  {
    question: "How accurate is the automatic song matching?",
    answer:
      "Our advanced algorithm achieves 90%+ accuracy in matching YouTube videos to Spotify songs. We clean video titles, remove noise words, and use similarity matching to find the best matches on Spotify.",
  },
  {
    question: "Do you store my Facebook or Spotify data?",
    answer:
      "No, we prioritize your privacy. All processing happens in your browser, and we don't store any of your personal data, Facebook posts, or Spotify information on our servers. Your data never leaves your device.",
  },
  {
    question: "Can I edit my Spotify playlist before it's created?",
    answer:
      "Yes! You can review all matched songs and remove any tracks you don't want before creating the final Spotify playlist. You have full control over what gets added to your playlist.",
  },
  {
    question: "What types of Facebook posts work with this playlist creator?",
    answer:
      "Our tool works with any Facebook posts that contain YouTube links - music videos, live performances, songs, covers, and more. We automatically filter and clean video titles to find matching tracks on Spotify.",
  },
  {
    question: "How long does it take to create a Spotify playlist from Facebook?",
    answer:
      "The process typically takes 2-5 minutes depending on how many YouTube videos you've shared on Facebook. Large collections may take slightly longer, but you'll see real-time progress updates.",
  },
  {
    question: "Can I use this Spotify playlist maker on mobile?",
    answer:
      "Yes! Our Spotmix playlist creator is fully responsive and works perfectly on all devices including smartphones, tablets, and desktop computers. Create playlists anywhere, anytime.",
  },
  {
    question: "What if a Facebook video doesn't have a Spotify match?",
    answer:
      "If we can't find a suitable match (below 60% accuracy), the song won't be added to your playlist. You'll see which videos couldn't be matched in the results, maintaining high playlist quality.",
  },
  {
    question: "Are my Spotify playlists created as public or private?",
    answer:
      "All playlists are created as private by default for your privacy. You can change the privacy settings later in your Spotify app if you want to make them public and share with friends.",
  },
  {
    question: "How do I make a Spotify playlist from YouTube videos?",
    answer:
      "With Spotmix, you don't need to manually convert YouTube videos. Just connect your Facebook account, and we'll automatically find all YouTube videos you've shared and convert them into a Spotify playlist instantly.",
  },
  {
    question: "Can I create multiple Spotify playlists?",
    answer:
      "You can create unlimited Spotify playlists using our free tool. Each time you run the process, you can create a new playlist with a different name and customize which songs to include.",
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  return (
    <section className="py-16 px-4 lg:px-8 bg-white bg-opacity-10 backdrop-blur-sm">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-black opacity-80">
            Everything you need to know about creating Spotify playlists from Facebook posts
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg border border-white border-opacity-30"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white hover:bg-opacity-10 transition-colors duration-200 rounded-lg"
              >
                <h3 className="text-lg font-semibold text-black pr-4">{faq.question}</h3>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-black flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-black flex-shrink-0" />
                )}
              </button>

              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-black opacity-80 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
