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
            This Privacy Policy explains how YouTube to Spotify Playlist Creator ("we", "our", or "us") handles your personal information when you use our service.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">2. Information We Access</h2>
          <p>
            When you log in with Facebook, our service temporarily accesses your Facebook posts to identify YouTube links you have shared. We also connect to your Spotify account to create a playlist. 
            We do not collect, store, or transmit your personal information to our own servers or share it with any third parties.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">3. How We Use Your Information</h2>
          <p>
            We use the accessed information solely to identify YouTube links in your Facebook posts and create a corresponding Spotify playlist. 
            This process occurs entirely within your browser, and no data is permanently retained after the playlist is generated.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">4. Data Security</h2>
          <p>
            Because we do not store your data, the risk of data breaches on our side is minimized. 
            We encourage you to keep your Facebook and Spotify accounts secure by using strong passwords and enabling available security features.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">5. Your Control and Rights</h2>
          <p>
            You can log out or clear your browser’s cache and local storage at any time to remove any temporary data related to our service from your device.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">6. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. Any changes will be posted on this page with an updated effective date.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">7. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our data handling practices, please contact us at <a href="mailto:youremail@example.com" className="text-blue-600 underline">youremail@example.com</a>.
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