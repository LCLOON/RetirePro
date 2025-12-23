import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Retirement Calculator Dashboard - Plan Your Financial Future',
  description: 'Access your personalized retirement planning dashboard. Track savings, run simulations, optimize Social Security, and get AI-powered recommendations for your retirement strategy.',
  openGraph: {
    title: 'RetirePro Dashboard - Your Retirement Planning Hub',
    description: 'Access your personalized retirement planning dashboard with Monte Carlo simulations, tax planning, and AI insights.',
    url: 'https://retirepro.io/app',
    type: 'website',
  },
  alternates: {
    canonical: 'https://retirepro.io/app',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
