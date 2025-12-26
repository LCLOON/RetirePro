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
    default: 'RetirePro - Free Retirement Planning Calculator | Monte Carlo Simulations',
    template: '%s | RetirePro - Retirement Calculator',
  },
  description: 'Free professional retirement planning calculator. Calculate your retirement income, run Monte Carlo simulations, optimize Social Security, and get AI-powered insights. Plan with confidence using our 401k, IRA, and pension calculators.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  manifest: '/manifest.json',
  keywords: [
    'retirement calculator',
    'retirement planning',
    'retirement planner',
    'Monte Carlo simulation',
    'retirement income calculator',
    'Social Security calculator',
    'Social Security optimizer',
    'retirement savings calculator',
    'FIRE calculator',
    'financial independence retire early',
    'retirement planning tool',
    'pension calculator',
    'net worth tracker',
    '401k calculator',
    'IRA calculator',
    'Roth IRA calculator',
    'retirement age calculator',
    'retirement income planner',
    'when can I retire',
    'how much do I need to retire',
    'retirement readiness',
    'safe withdrawal rate',
    '4% rule calculator',
    'retirement budget planner',
    'estate planning',
    'tax planning retirement',
    'required minimum distribution RMD',
    'inherited IRA calculator',
  ],
  authors: [{ name: 'RetirePro', url: 'https://retirepro.io' }],
  creator: 'RetirePro',
  publisher: 'RetirePro',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
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
    title: 'RetirePro - Free Retirement Planning Calculator with AI Insights',
    description: 'Plan your retirement with confidence. Free professional calculator with Monte Carlo simulations, Social Security optimizer, tax planning, and AI-powered insights. Trusted by 50,000+ users.',
    images: [
      {
        url: 'https://retirepro.io/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RetirePro - Professional Retirement Planning Calculator Dashboard',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@retirepro',
    creator: '@retirepro',
    title: 'RetirePro - Free Retirement Calculator with Monte Carlo Simulations',
    description: 'Plan your retirement with confidence. Free professional calculator with Monte Carlo simulations, Social Security optimizer, and AI-powered insights.',
    images: {
      url: 'https://retirepro.io/og-image.png',
      alt: 'RetirePro - Professional Retirement Planning Calculator',
    },
  },
  alternates: {
    canonical: 'https://retirepro.io',
    languages: {
      'en-US': 'https://retirepro.io',
    },
  },
  category: 'Finance',
  classification: 'Financial Calculator',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    // Add verification tokens when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  appleWebApp: {
    capable: true,
    title: 'RetirePro',
    statusBarStyle: 'black-translucent',
  },
  applicationName: 'RetirePro',
  generator: 'Next.js',
  other: {
    'msapplication-TileColor': '#10b981',
    'msapplication-config': '/browserconfig.xml',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'mobile-web-app-capable': 'yes',
  },
};

// JSON-LD Structured Data for SEO - Multiple schemas for better search visibility
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  '@id': 'https://retirepro.io/#webapp',
  name: 'RetirePro',
  headline: 'Free Professional Retirement Planning Calculator',
  description: 'Professional retirement planning calculator with Monte Carlo simulations, Social Security optimizer, AI-powered insights, and comprehensive financial analytics. Free to use.',
  url: 'https://retirepro.io',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web Browser',
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
  softwareVersion: '3.0',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '0',
    highPrice: '12',
    priceCurrency: 'USD',
    offerCount: 3,
    offers: [
      {
        '@type': 'Offer',
        name: 'Free Plan',
        price: '0',
        priceCurrency: 'USD',
        description: 'Basic retirement planning features',
      },
      {
        '@type': 'Offer',
        name: 'Pro Plan',
        price: '7',
        priceCurrency: 'USD',
        description: 'Advanced analytics and Monte Carlo simulations',
      },
      {
        '@type': 'Offer',
        name: 'Premium Plan',
        price: '12',
        priceCurrency: 'USD',
        description: 'Full access with AI advisor and all features',
      },
    ],
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '2847',
    bestRating: '5',
    worstRating: '1',
    reviewCount: '1523',
  },
  featureList: [
    'Monte Carlo Retirement Simulations',
    'Social Security Optimizer',
    'AI-Powered Financial Advisor',
    '401k and IRA Calculator',
    'Tax Planning Tools',
    'Net Worth Tracker',
    'Retirement Income Projections',
    'Estate Planning',
  ],
  screenshot: 'https://retirepro.io/hero-image.png',
  creator: {
    '@type': 'Organization',
    name: 'RetirePro',
    url: 'https://retirepro.io',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://retirepro.io/#organization',
  name: 'RetirePro',
  url: 'https://retirepro.io',
  logo: 'https://retirepro.io/icon-512.png',
  description: 'Professional retirement planning tools and calculators',
  sameAs: [
    'https://twitter.com/retirepro',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://retirepro.io/#website',
  name: 'RetirePro',
  url: 'https://retirepro.io',
  description: 'Free professional retirement planning calculator with Monte Carlo simulations and AI-powered insights',
  publisher: {
    '@id': 'https://retirepro.io/#organization',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://retirepro.io/app',
    },
    'query-input': 'required name=search_term_string',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://retirepro.io/#faq',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is RetirePro free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! RetirePro offers a free plan with full access to basic retirement planning tools. No credit card required. Premium features are available with Pro and Premium subscriptions.',
      },
    },
    {
      '@type': 'Question',
      name: 'How accurate are the retirement projections?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'RetirePro uses industry-standard Monte Carlo simulations running thousands of scenarios to project retirement outcomes. Our calculations factor in market volatility, inflation, Social Security, and tax implications for comprehensive projections.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does RetirePro provide financial advice?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, RetirePro provides educational tools and calculations only. We do not provide personalized financial, investment, tax, or legal advice. Always consult with qualified professionals before making financial decisions.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my financial data secure?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, your data is stored locally in your browser and is not transmitted to our servers. We use industry-standard encryption for all data transmission, and payment processing is handled by Stripe (PCI-DSS compliant).',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://retirepro.io',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Retirement Calculator',
      item: 'https://retirepro.io/app',
    },
  ],
};

const jsonLdScripts = [
  webApplicationSchema,
  organizationSchema,
  websiteSchema,
  faqSchema,
  breadcrumbSchema,
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head suppressHydrationWarning>
        {/* Theme initialization - runs before React hydrates to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('retirepro-theme-v3');
                  // Always start with dark, then useEffect will adjust
                  document.documentElement.classList.add('dark');
                  if (theme === 'medium') {
                    document.documentElement.classList.add('medium');
                    document.documentElement.classList.remove('dark');
                  } else if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch for third-party services */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />
        
        {/* JSON-LD Structured Data for SEO */}
        {jsonLdScripts.map((schema, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
