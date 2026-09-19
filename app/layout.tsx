import type React from "react"
import type { Metadata } from "next"
import { GeistMono } from "geist/font/mono"
import { Gabarito } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import ThemeColorUpdater from "@/components/theme-color-updater"

const gabarito = Gabarito({
  subsets: ["latin"],
  variable: "--font-gabarito",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Gastos Compartidos - Gestiona gastos grupales",
  description: "Aplicación para gestionar gastos compartidos entre amigos y familiares",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gastos Compartidos",
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: "#fbfbfa",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${gabarito.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.jpg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Gastos" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#fbfbfa" />
      </head>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true} storageKey="theme">
          <ThemeColorUpdater />
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
