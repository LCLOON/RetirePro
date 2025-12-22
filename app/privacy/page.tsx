import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'RetirePro Privacy Policy - Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="text-xl font-bold text-white">RetirePro</span>
            </Link>
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-slate-400 mb-8">Last updated: December 22, 2025</p>

          <div className="prose prose-invert prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">1. Introduction</h2>
              <p className="text-slate-300 mb-4">
                RetirePro (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our retirement 
                planning service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mb-3 text-white">2.1 Information You Provide</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mb-4">
                <li>Account information (email, name)</li>
                <li>Financial data you enter for retirement planning (savings, income, expenses)</li>
                <li>Payment information (processed securely by Stripe)</li>
                <li>Communications with our support team</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-white">2.2 Automatically Collected Information</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mb-4">
                <li>Device information (browser type, operating system)</li>
                <li>Usage data (pages visited, features used)</li>
                <li>IP address and approximate location</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">3. How We Use Your Information</h2>
              <p className="text-slate-300 mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mb-4">
                <li>Provide and maintain our retirement planning service</li>
                <li>Process your subscription payments</li>
                <li>Send you service-related notifications</li>
                <li>Improve and optimize our service</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Detect and prevent fraud or abuse</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">4. Data Security</h2>
              <p className="text-slate-300 mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mb-4">
                <li>256-bit SSL/TLS encryption for all data transmission</li>
                <li>Encrypted data storage at rest</li>
                <li>Regular security audits and penetration testing</li>
                <li>PCI-DSS compliant payment processing via Stripe</li>
                <li>Access controls and authentication mechanisms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">5. Data Sharing</h2>
              <p className="text-slate-300 mb-4">
                We do NOT sell your personal information. We may share your information only with:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mb-4">
                <li><strong className="text-white">Payment processors:</strong> Stripe, for subscription billing</li>
                <li><strong className="text-white">Analytics providers:</strong> To understand service usage</li>
                <li><strong className="text-white">Legal requirements:</strong> When required by law or legal process</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">6. Cookies</h2>
              <p className="text-slate-300 mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mb-4">
                <li>Keep you signed in to your account</li>
                <li>Remember your preferences and settings</li>
                <li>Analyze how our service is used</li>
                <li>Improve your user experience</li>
              </ul>
              <p className="text-slate-300 mb-4">
                You can control cookies through your browser settings. Note that disabling cookies may affect 
                service functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">7. Your Rights (GDPR/CCPA)</h2>
              <p className="text-slate-300 mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mb-4">
                <li><strong className="text-white">Access:</strong> Request a copy of your personal data</li>
                <li><strong className="text-white">Rectification:</strong> Correct inaccurate data</li>
                <li><strong className="text-white">Deletion:</strong> Request deletion of your data</li>
                <li><strong className="text-white">Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong className="text-white">Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
              <p className="text-slate-300 mb-4">
                To exercise these rights, contact us at privacy@retirepro.io
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">8. Data Retention</h2>
              <p className="text-slate-300 mb-4">
                We retain your personal data for as long as your account is active or as needed to provide services. 
                If you delete your account, we will delete your data within 30 days, except where retention is 
                required by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">9. Children&apos;s Privacy</h2>
              <p className="text-slate-300 mb-4">
                RetirePro is not intended for use by individuals under 18 years of age. We do not knowingly collect 
                personal information from children.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">10. Changes to This Policy</h2>
              <p className="text-slate-300 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by 
                posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">11. Contact Us</h2>
              <p className="text-slate-300 mb-4">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-emerald-400 mb-2">privacy@retirepro.io</p>
              <p className="text-slate-300">
                RetirePro<br />
                Data Protection Officer
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-400 text-sm">© 2025 RetirePro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
