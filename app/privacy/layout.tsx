import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'RetirePro Privacy Policy. Learn how we protect your data and respect your privacy when using our retirement planning calculator.',
  robots: {
    index: true,
    follow: false,
  },
  alternates: {
    canonical: 'https://retirepro.io/privacy',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
