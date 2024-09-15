// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch("http://localhost:8000/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            username: credentials?.username || "",
            password: credentials?.password || "",
          }),
        });

        const user = await res.json();

        // If login is successful and user object contains access token and username
        if (res.ok && user) {
          return {
            ...user,
            username: credentials?.username // Add the username to the user object
          };
        }

        // Login failed
        return null;
      }


    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.access_token;
        token.username = user.username; // Add username to the JWT token
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user = {
        ...session.user,
        username: token.username as string, // Add username to the session
      };
      return session;
    },
  },


  secret: process.env.NEXTAUTH_SECRET,
};

// Export the NextAuth handler using Next.js route handler format
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
