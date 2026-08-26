import { Geist_Mono } from "next/font/google"
import type { Metadata } from "next"

import "@/app/globals.css"
import { cn } from "@/lib/utils"
import { Provider } from "@/components/provider"

const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  metadataBase: new URL("https://shrtn.mosabbir.dev"),
  title: "SHRTN | Edge-Resolved URL Shortener",
  description: "A blazing fast, globally distributed URL shortener built on Cloudflare Workers and D1.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SHRTN | Edge-Resolved URL Shortener",
    description: "A blazing fast, globally distributed URL shortener built on Cloudflare Workers and D1.",
    url: "/",
    siteName: "SHRTN",
    images: [
      {
        url: "/og-graph.webp",
        width: 1200,
        height: 630,
        alt: "SHRTN Mockup",
      },
    ],
    locale: "en_US",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-svh bg-background font-mono antialiased overflow-x-hidden",
          fontMono.variable
        )}
      >
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  )
}
