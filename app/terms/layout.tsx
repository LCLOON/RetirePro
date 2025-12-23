import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'RetirePro Terms of Service. Read our terms and conditions for using the RetirePro retirement planning calculator and services.',
  robots: {
    index: true,
    follow: false,
  },
  alternates: {
    canonical: 'https://retirepro.io/terms',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
