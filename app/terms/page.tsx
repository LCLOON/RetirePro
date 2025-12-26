import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'RetirePro Terms of Service - Read our terms and conditions for using the RetirePro retirement planning platform.',
};

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-slate-400 mb-8">Last updated: December 22, 2025</p>

          <div className="prose prose-invert prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
              <p className="text-slate-300 mb-4">
                By accessing or using RetirePro (&quot;Service&quot;), you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">2. Description of Service</h2>
              <p className="text-slate-300 mb-4">
                RetirePro is a retirement planning calculator and analysis tool. The Service provides:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mb-4">
                <li>Retirement income projections and calculations</li>
                <li>Monte Carlo simulations for retirement planning</li>
                <li>Social Security benefit estimations</li>
                <li>Net worth tracking and analysis</li>
                <li>AI-powered retirement insights (Premium tier)</li>
                <li>Tax planning tools and strategies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">3. Not Financial Advice</h2>
              <p className="text-slate-300 mb-4">
                <strong className="text-white">IMPORTANT:</strong> RetirePro provides educational information and planning tools only. 
                The Service does NOT provide financial, investment, tax, or legal advice. All calculations and projections 
                are estimates based on the data you provide and should not be relied upon as the sole basis for making 
                financial decisions.
              </p>
              <p className="text-slate-300 mb-4">
                You should consult with a qualified financial advisor, tax professional, or legal counsel before making 
                any financial decisions. RetirePro is not responsible for any decisions you make based on information 
                provided by the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">4. User Accounts</h2>
              <p className="text-slate-300 mb-4">
                You are responsible for maintaining the confidentiality of your account and password. You agree to accept 
                responsibility for all activities that occur under your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">5. Subscription and Billing</h2>
              <p className="text-slate-300 mb-4">
                RetirePro offers Free, Pro, and Premium subscription tiers. Paid subscriptions are billed monthly or 
                annually as selected at checkout. All payments are processed securely through Stripe.
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mb-4">
                <li>Subscriptions automatically renew unless cancelled</li>
                <li>You may cancel at any time through your account settings</li>
                <li>Refunds are available within 30 days of purchase</li>
                <li>Price changes will be communicated 30 days in advance</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">6. Data Accuracy</h2>
              <p className="text-slate-300 mb-4">
                While we strive to provide accurate calculations and data, RetirePro makes no guarantees about the 
                accuracy, reliability, or completeness of any information provided. Market conditions, tax laws, and 
                other factors may change without notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">7. Limitation of Liability</h2>
              <p className="text-slate-300 mb-4">
                To the maximum extent permitted by law, RetirePro shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred 
                directly or indirectly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">8. Changes to Terms</h2>
              <p className="text-slate-300 mb-4">
                We reserve the right to modify these terms at any time. We will notify users of significant changes 
                via email or through the Service. Your continued use of the Service after changes constitutes 
                acceptance of the modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">9. Governing Law</h2>
              <p className="text-slate-300 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, 
                United States, without regard to its conflict of law provisions. You agree to submit to the personal 
                and exclusive jurisdiction of the courts located in Delaware.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">10. Dispute Resolution</h2>
              <p className="text-slate-300 mb-4">
                Any dispute arising from these Terms or your use of the Service shall first be attempted to be resolved 
                through informal negotiation. If the dispute cannot be resolved informally within 30 days, either party 
                may initiate binding arbitration in accordance with the American Arbitration Association rules. 
                The arbitration shall be conducted in Delaware, and the arbitrator&apos;s decision shall be final and binding.
              </p>
              <p className="text-slate-300 mb-4">
                <strong className="text-white">Class Action Waiver:</strong> You agree that any dispute resolution proceedings 
                will be conducted only on an individual basis and not in a class, consolidated, or representative action.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">11. Contact Information</h2>
              <p className="text-slate-300 mb-4">
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-emerald-400">support@retirepro.io</p>
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
