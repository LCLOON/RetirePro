import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#10b981',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://retirepro.io'),
  title: {
    default: 'RetirePro - Professional Retirement Planning Calculator',
    template: '%s | RetirePro',
  },
  description: 'Plan your retirement with confidence. Calculate, analyze, and forecast your retirement income with Monte Carlo simulations, AI-powered insights, and professional analytics. Free retirement calculator.',
  keywords: [
    'retirement calculator',
    'retirement planning',
    'retirement planner',
    'Monte Carlo simulation',
    'retirement income calculator',
    'Social Security calculator',
    'retirement savings calculator',
    'FIRE calculator',
    'financial independence',
    'retirement planning tool',
    'pension calculator',
    'net worth tracker',
    '401k calculator',
    'retirement age calculator',
    'retirement income planner',
  ],
  authors: [{ name: 'RetirePro' }],
  creator: 'RetirePro',
  publisher: 'RetirePro',
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
    type: 'website',
    locale: 'en_US',
    url: 'https://retirepro.io',
    siteName: 'RetirePro',
    title: 'RetirePro - Professional Retirement Planning Calculator',
    description: 'Plan your retirement with confidence. Calculate, analyze, and forecast your retirement income with Monte Carlo simulations, AI-powered insights, and professional analytics.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RetirePro - Professional Retirement Planning Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RetirePro - Professional Retirement Planning Calculator',
    description: 'Plan your retirement with confidence. Calculate, analyze, and forecast your retirement income with Monte Carlo simulations and AI-powered insights.',
    images: ['/og-image.png'],
    creator: '@retirepro',
  },
  alternates: {
    canonical: 'https://retirepro.io',
  },
  category: 'Finance',
  verification: {
    // Add verification tokens when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'format-detection': 'telephone=no',
  },
};

// JSON-LD Structured Data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'RetirePro',
  description: 'Professional retirement planning calculator with Monte Carlo simulations, AI-powered insights, and comprehensive analytics.',
  url: 'https://retirepro.io',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '0',
    highPrice: '12',
    priceCurrency: 'USD',
    offerCount: 3,
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '2847',
    bestRating: '5',
    worstRating: '1',
  },
  creator: {
    '@type': 'Organization',
    name: 'RetirePro',
    url: 'https://retirepro.io',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
