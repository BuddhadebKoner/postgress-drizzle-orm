import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider, SignedIn, SignedOut, SignIn } from "@clerk/nextjs";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BlogApp - Your Personal Blog",
  description: "A modern blog application built with Next.js and Clerk",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background font-sans`}
        >
          <SignedOut>
            <div className="flex items-center justify-center min-h-screen bg-background">
              <SignIn
                appearance={{
                  elements: {
                    card: "bg-card border-border",
                    headerTitle: "text-foreground",
                    headerSubtitle: "text-muted-foreground",
                  },
                }}
              />
            </div>
          </SignedOut>
          <SignedIn>
            <Navbar />
            <main className="flex-1">{children}</main>
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  );
}
