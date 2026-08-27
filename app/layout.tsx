import { Geist_Mono } from "next/font/google"
import type { Metadata, Viewport } from "next"
import Script from "next/script"

import "@/app/globals.css"
import { cn } from "@/lib/utils"
import { Provider } from "@/components/provider"

const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: new URL("https://urltrim.pages.dev"),
  title: {
    default: "URLTrim | Edge-Resolved URL Shortener",
    template: "%s | URLTrim"
  },
  description: "A blazing fast, globally distributed URL shortener built on Cloudflare Workers and D1.",
  applicationName: "URLTrim",
  keywords: ["URL shortener", "link shortener", "edge shortener", "Cloudflare Workers", "D1 database", "fast links"],
  authors: [{ name: "URLTrim" }],
  creator: "URLTrim",
  publisher: "URLTrim",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "URLTrim | Edge-Resolved URL Shortener",
    description: "A blazing fast, globally distributed URL shortener built on Cloudflare Workers and D1.",
    url: "/",
    siteName: "URLTrim",
    images: [
      {
        url: "/opengraph.webp",
        width: 1200,
        height: 630,
        alt: "URLTrim Mockup",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "URLTrim | Edge-Resolved URL Shortener",
    description: "A blazing fast, globally distributed URL shortener built on Cloudflare Workers and D1.",
    creator: "@URLTrim", // Optional placeholder
    images: ["/opengraph.webp"],
  },
  appleWebApp: {
    title: "URLTrim",
    statusBarStyle: "black-translucent",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </head>
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
