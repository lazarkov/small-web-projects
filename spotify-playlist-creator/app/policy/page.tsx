import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Spotmix Playlist Creator - Data Policy</h1>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">About Our Service</h2>
          <p>
            The Spotmix Playlist Creator is a web application that allows users to create Spotify playlists from their
            Facebook-shared YouTube videos. We prioritize user privacy and data protection in our service.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Data Handling</h2>
          <p>Our application is designed with privacy in mind:</p>
          <ul className="list-disc list-inside mt-2">
            <li>No user data is stored in the cloud.</li>
            <li>All data processing occurs within your browser.</li>
            <li>Your data does not leave your browser at any point during the playlist creation process.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Data Deletion</h2>
          <p>To comply with privacy regulations, users of Spotmix Playlist Creator can easily manage their data:</p>
          <ol className="list-decimal list-inside mt-2">
            <li>No manual deletion is necessary as we don't store your data.</li>
            <li>To remove any local browser data, clear your browser cache and local storage.</li>
            <li>You can sign out of the application at any time to revoke access.</li>
          </ol>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Data Deletion</h2>
          <p>
            If you want to delete your local browser data or request complete account deletion, you can visit our data
            deletion page or contact us directly.
          </p>
          <div className="mt-4">
            <Button asChild variant="outline" className="mr-4 bg-transparent">
              <Link href="/data-deletion">Delete My Data</Link>
            </Button>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
          <p>
            If you have any questions about our data handling practices or need assistance, please contact us at:
            admin@spotmix.me
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
