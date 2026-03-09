import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
})

const _geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false, // No precargar fuente mono ya que se usa poco
})

const _cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"], // Reducido de 5 pesos a 3
  variable: "--font-serif",
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL("https://elromeral.com.mx"),
  title: "El Romeral - Jardín para Bodas en Guadalajara | Venue de Eventos",
  description:
    "El Romeral es el jardín perfecto para tu boda en Guadalajara. Espacios naturales únicos, servicios personalizados y paquetes todo incluido. Cotiza tu boda ideal hoy.",
  generator: "v0.app",
  keywords: [
    "bodas guadalajara",
    "jardín de eventos",
    "venue bodas",
    "salón de eventos guadalajara",
    "boda en jardín",
    "el romeral",
  ],
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "El Romeral - Jardín para Bodas en Guadalajara",
    description: "El jardín perfecto para tu boda. Espacios naturales únicos y servicios personalizados.",
    url: "https://elromeral.com.mx",
    siteName: "El Romeral",
    images: [
      {
        url: "/images/40-20iluminaciones-20-281-29.jpeg",
        width: 1200,
        height: 630,
        alt: "El Romeral - Jardín nocturno con iluminación elegante",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "El Romeral - Jardín para Bodas en Guadalajara",
    description: "El jardín perfecto para tu boda. Espacios naturales únicos y servicios personalizados.",
    images: ["/images/40-20iluminaciones-20-281-29.jpeg"],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4a5043",
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body
        className={`${_geist.variable} ${_geistMono.variable} ${_cormorantGaramond.variable} font-sans antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  )
}
