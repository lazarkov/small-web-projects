import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Privacy Policy</h1>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
          <p>
            This Privacy Policy explains how YouTube to Spotify Playlist Creator ("we", "our", or "us") collects, uses,
            and protects your personal information when you use our service.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">2. Information We Collect</h2>
          <p>
            We do not store any of your personal information on our servers. All data processing occurs within your
            browser.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">3. How We Use Your Information</h2>
          <p>
            We use your information solely for the purpose of creating Spotify playlists from your Facebook-shared
            YouTube videos. This process occurs entirely within your browser.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">4. Data Security</h2>
          <p>
            As we do not store your data, the risk of data breaches on our end is minimized. However, we encourage you
            to keep your Facebook and Spotify accounts secure.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">5. Your Rights</h2>
          <p>
            You have the right to clear your browser cache and local storage at any time, effectively removing any data
            related to our service from your device.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">6. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. We will notify you of any changes by posting the new policy on
            this page.
          </p>
        </section>

        <div className="text-center mt-8">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
