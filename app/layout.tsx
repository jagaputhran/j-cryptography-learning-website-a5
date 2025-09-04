import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ProgressProvider } from "@/components/progress-tracker"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "CryptoQuest - Learn Cryptography Through Adventure",
  description: "Interactive cryptography learning platform with Alice & Bob stories, animations, and gamification",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <ProgressProvider>{children}</ProgressProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
