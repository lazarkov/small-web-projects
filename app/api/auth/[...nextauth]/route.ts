import NextAuth, { NextAuthOptions } from "next-auth"
import FacebookProvider from "next-auth/providers/facebook"
import SpotifyProvider from "next-auth/providers/spotify"

export const authOptions: NextAuthOptions = {
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
      authorization: {
        params: {
          scope: "email public_profile user_posts",
        },
      },
    }),
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "user-read-email playlist-modify-public playlist-modify-private",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      session.accessToken = token.accessToken
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

