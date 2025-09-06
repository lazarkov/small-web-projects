"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

const faqs = [
  {
    question: "How do I convert YouTube videos from Facebook to Spotify playlists?",
    answer:
      "Simply connect your Facebook account, and our tool will automatically scan your posts for YouTube video shares. Then connect Spotify, and we'll create a playlist with matching songs found on Spotify.",
  },
  {
    question: "Is the Spotmix playlist creator free?",
    answer:
      "Yes! Our Spotmix converter is completely free to use. You can create unlimited playlists from your Facebook shared YouTube videos without any cost.",
  },
  {
    question: "How accurate is the song matching from Spotmix?",
    answer:
      "Our advanced algorithm achieves 90%+ accuracy in matching YouTube videos to Spotify songs. We clean video titles and use similarity matching to find the best matches.",
  },
  {
    question: "Do you store my Facebook or Spotify data?",
    answer:
      "No, we prioritize your privacy. All processing happens in your browser, and we don't store any of your personal data, Facebook posts, or Spotify information on our servers.",
  },
  {
    question: "Can I edit the playlist before it's created on Spotify?",
    answer:
      "Yes! You can review all matched songs and remove any tracks you don't want before creating the final Spotify playlist.",
  },
  {
    question: "What types of YouTube videos can be converted to Spotify?",
    answer:
      "Our tool works best with music videos, live performances, and songs. We automatically filter and clean video titles to find matching tracks on Spotify.",
  },
  {
    question: "How long does it take to create a Spotify playlist from Facebook videos?",
    answer:
      "The process typically takes 2-5 minutes depending on how many YouTube videos you've shared on Facebook. Large collections may take slightly longer.",
  },
  {
    question: "Can I use this tool on mobile devices?",
    answer:
      "Yes! Our Spotmix playlist creator is fully responsive and works on all devices including smartphones, tablets, and desktop computers.",
  },
  {
    question: "What if a YouTube video doesn't have a match on Spotify?",
    answer:
      "If we can't find a suitable match (below 60% accuracy), the song won't be added to your playlist. You'll see which videos couldn't be matched in the results.",
  },
  {
    question: "Is my Spotify playlist created as public or private?",
    answer:
      "All playlists are created as private by default. You can change the privacy settings later in your Spotify app if you want to make them public.",
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
            Everything you need to know about converting YouTube videos to Spotify playlists
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
