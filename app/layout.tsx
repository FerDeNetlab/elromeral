import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Cormorant_Garamond, Montserrat } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { GoogleTagManager } from "@next/third-parties/google"
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
  preload: false,
})

const _cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
  preload: true,
})

const _montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-montserrat",
  display: "swap",
  preload: false,
})

export const metadata: Metadata = {
  metadataBase: new URL("https://elromeral.com.mx"),

  // ── Titles ──────────────────────────────────────────────────────────────
  title: {
    default: "El Romeral · Bodas & Eventos en Guadalajara | Venue Premium Zapopan",
    template: "%s · El Romeral Guadalajara",
  },

  // ── Description ─────────────────────────────────────────────────────────
  description:
    "El Romeral en Zapopan, Guadalajara: venue premium para bodas, XV años, bautizos y eventos corporativos. Producción integral, gastronomía de autor y espacios únicos. Más de 20 años de experiencia. Cotiza hoy.",

  // ── Keywords — MX + US diaspora ─────────────────────────────────────────
  keywords: [
    // Español · México
    "bodas guadalajara",
    "venue bodas guadalajara",
    "salón de eventos guadalajara",
    "jardín de eventos guadalajara",
    "xv años guadalajara",
    "quinceañera guadalajara",
    "bautizo guadalajara",
    "eventos corporativos guadalajara",
    "producción de eventos guadalajara",
    "organizador de bodas guadalajara",
    "boda todo incluido guadalajara",
    "venue premium guadalajara",
    "el romeral zapopan",
    "bodas zapopan",
    "jardín bodas jalisco",
    "hacienda bodas guadalajara",
    "comunión guadalajara",
    "eventos diurnos guadalajara",
    "gastronomía eventos guadalajara",
    "coordinación de bodas guadalajara",
    // English · US diaspora
    "wedding venue guadalajara",
    "quinceanera venue guadalajara",
    "event venue guadalajara mexico",
    "wedding hall guadalajara jalisco",
    "luxury wedding venue mexico",
    "quinceañera venue mexico",
    "wedding coordinator guadalajara",
    "all inclusive wedding guadalajara",
  ],

  // ── Canonical & alternates ───────────────────────────────────────────────
  alternates: {
    canonical: "https://elromeral.com.mx",
    languages: {
      "es-MX": "https://elromeral.com.mx",
      "x-default": "https://elromeral.com.mx",
    },
  },

  // ── Icons ────────────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },

  // ── Open Graph ───────────────────────────────────────────────────────────
  openGraph: {
    title: "El Romeral · Bodas & Eventos en Guadalajara",
    description:
      "Venue premium para bodas, XV años, bautizos y eventos corporativos en Zapopan, Guadalajara. Producción integral. Gastronomía de autor. Más de 20 años de experiencia.",
    url: "https://elromeral.com.mx",
    siteName: "El Romeral",
    images: [
      {
        url: "/images/redesign/venue-salon.jpg",
        width: 1200,
        height: 630,
        alt: "El Romeral — Salón de eventos premium en Zapopan, Guadalajara",
      },
      {
        url: "/images/redesign/boda-dia.jpg",
        width: 1200,
        height: 630,
        alt: "Boda de día en El Romeral, Guadalajara",
      },
    ],
    locale: "es_MX",
    type: "website",
  },

  // ── Twitter / X ──────────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "El Romeral · Bodas & Eventos en Guadalajara",
    description:
      "Venue premium en Zapopan, Guadalajara. Bodas, XV años, bautizos y eventos corporativos. Producción integral. Cotiza hoy.",
    images: ["/images/redesign/venue-salon.jpg"],
  },

  // ── Google / robots ──────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Google Search Console verification ──────────────────────────────────
  // Descomenta y agrega tu código cuando lo tengas:
  // verification: {
  //   google: "TU_CODIGO_DE_VERIFICACION",
  // },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#B8935A",
  viewportFit: "cover",
}

// ── JSON-LD Structured Data ───────────────────────────────────────────────────
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["EventVenue", "LocalBusiness"],
      "@id": "https://elromeral.com.mx/#venue",
      name: "El Romeral",
      description:
        "Venue premium para bodas, XV años, bautizos y eventos corporativos en Zapopan, Guadalajara. Producción integral con más de 20 años de experiencia.",
      url: "https://elromeral.com.mx",
      telephone: "+523336821088",
      email: "contacto@elromeral.com.mx",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Prolongación Av. Vallarta 2951",
        addressLocality: "Zapopan",
        addressRegion: "Jalisco",
        postalCode: "45010",
        addressCountry: "MX",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 20.6735,
        longitude: -103.4376,
      },
      hasMap: "https://maps.google.com/?q=El+Romeral+Prolongacion+Av+Vallarta+2951+Zapopan+Jalisco",
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "17:00",
        },
      ],
      priceRange: "$$$",
      currenciesAccepted: "MXN",
      paymentAccepted: "Cash, Credit Card, Bank Transfer",
      image: [
        "https://elromeral.com.mx/images/redesign/venue-salon.jpg",
        "https://elromeral.com.mx/images/redesign/boda-dia.jpg",
        "https://elromeral.com.mx/images/redesign/xv-noche.jpg",
        "https://elromeral.com.mx/images/redesign/venue-lago-fuego.jpg",
      ],
      areaServed: [
        { "@type": "City", name: "Guadalajara" },
        { "@type": "City", name: "Zapopan" },
        { "@type": "AdministrativeArea", name: "Jalisco" },
        { "@type": "Country", name: "México" },
      ],
      amenityFeature: [
        { "@type": "LocationFeatureSpecification", name: "Estacionamiento", value: true },
        { "@type": "LocationFeatureSpecification", name: "Área al aire libre", value: true },
        { "@type": "LocationFeatureSpecification", name: "Salón techado", value: true },
        { "@type": "LocationFeatureSpecification", name: "Gastronomía propia", value: true },
        { "@type": "LocationFeatureSpecification", name: "Acceso para personas con discapacidad", value: true },
      ],
      // Tipos de eventos que se realizan
      knowsAbout: [
        "Bodas",
        "XV Años",
        "Quinceañeras",
        "Bautizos",
        "Comuniones",
        "Eventos Corporativos",
        "Producción de Eventos",
        "Gastronomía de Autor",
        "Coordinación de Bodas",
        "Diseño de Eventos",
      ],
    },
    {
      "@type": "Organization",
      "@id": "https://elromeral.com.mx/#organization",
      name: "El Romeral",
      url: "https://elromeral.com.mx",
      logo: {
        "@type": "ImageObject",
        url: "https://elromeral.com.mx/favicon.png",
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+523336821088",
          contactType: "customer service",
          areaServed: ["MX", "US"],
          availableLanguage: ["Spanish"],
          contactOption: "TollFree",
        },
        {
          "@type": "ContactPoint",
          contactType: "sales",
          email: "contacto@elromeral.com.mx",
          areaServed: ["MX", "US"],
          availableLanguage: ["Spanish"],
        },
      ],
      foundingDate: "2004",
      numberOfEmployees: { "@type": "QuantitativeValue", value: 20 },
    },
    {
      "@type": "WebSite",
      "@id": "https://elromeral.com.mx/#website",
      url: "https://elromeral.com.mx",
      name: "El Romeral",
      description: "Venue premium para bodas y eventos en Guadalajara, Jalisco",
      publisher: { "@id": "https://elromeral.com.mx/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: "https://elromeral.com.mx/galeria?q={search_term_string}" },
        "query-input": "required name=search_term_string",
      },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID

  return (
    <html lang="es">
      {/* Google Tag Manager — carga optimizada via @next/third-parties */}
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${_geist.variable} ${_geistMono.variable} ${_cormorantGaramond.variable} ${_montserrat.variable} font-sans antialiased`}
      >
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.error('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
