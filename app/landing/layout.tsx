import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RetirePro - Free Retirement Planning Calculator | Monte Carlo Simulations & AI Advisor',
  description: 'Plan your retirement with confidence using our free professional calculator. Features Monte Carlo simulations, Social Security optimizer, AI-powered insights, 401k/IRA calculators, and comprehensive tax planning. Trusted by 50,000+ users.',
  keywords: [
    'free retirement calculator',
    'retirement planning calculator',
    'Monte Carlo retirement simulation',
    'Social Security calculator',
    'when can I retire calculator',
    'retirement income calculator',
    '401k calculator',
    'FIRE calculator',
    'financial independence calculator',
  ],
  openGraph: {
    title: 'RetirePro - Free Retirement Planning Calculator',
    description: 'Plan your retirement with confidence. Free professional calculator with Monte Carlo simulations, Social Security optimizer, and AI-powered insights.',
    url: 'https://retirepro.io/landing',
    type: 'website',
  },
  twitter: {
    title: 'RetirePro - Free Retirement Calculator',
    description: 'Plan your retirement with confidence. Free professional calculator with Monte Carlo simulations and AI-powered insights.',
  },
  alternates: {
    canonical: 'https://retirepro.io/landing',
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
