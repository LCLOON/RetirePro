'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CookieConsent } from '@/components/CookieConsent';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Price IDs from Stripe Dashboard
const PRICE_IDS = {
  pro: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
  },
  premium: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY || 'price_premium_monthly',
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY || 'price_premium_yearly',
  },
};

// FAQ Data
const faqData = [
  {
    question: 'Is my financial data secure?',
    answer: 'Absolutely. We use 256-bit SSL encryption for all data transmission, and your data is encrypted at rest. We never store your login credentials to financial institutions. All payment processing is handled by Stripe, which is PCI-DSS compliant.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. Your access will continue until the end of your current billing period.',
  },
  {
    question: 'Do you offer a free trial?',
    answer: 'Yes! Our Free plan gives you full access to basic retirement planning tools forever. No credit card required. You can upgrade to Pro or Premium anytime to unlock advanced features.',
  },
  {
    question: 'Is this financial advice?',
    answer: 'No, RetirePro provides educational tools and calculations only. We do not provide personalized financial, investment, tax, or legal advice. Always consult with qualified professionals before making financial decisions.',
  },
  {
    question: 'How accurate are the projections?',
    answer: 'Our projections use industry-standard calculations and Monte Carlo simulations. However, all projections are estimates based on the assumptions you provide. Actual results will vary based on market conditions, inflation, and other factors.',
  },
  {
    question: 'Can I export my data?',
    answer: 'Pro and Premium subscribers can export their data in JSON format. Premium subscribers also get access to PDF reports and advanced export options.',
  },
];

export default function LandingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCheckout = async (plan: 'pro' | 'premium') => {
    setIsLoading(plan);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: PRICE_IDS[plan][billingPeriod],
          billingPeriod,
          plan,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error instanceof Error ? error.message : 'Failed to start checkout. Please try again.');
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="text-xl font-bold text-white">RetirePro</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">How It Works</a>
              <a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</a>
              <a href="#testimonials" className="text-slate-400 hover:text-white transition-colors">Testimonials</a>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/app" className="text-slate-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link 
                href="/app" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
            <span className="text-emerald-400 text-sm font-medium">🚀 Now with AI-Powered Insights</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Plan Your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              Dream Retirement
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            Calculate, analyze, and forecast your retirement income. Make smarter financial 
            decisions with AI-powered insights and professional analytics.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link 
              href="/app" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-emerald-500/25"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/app" 
              className="text-slate-400 hover:text-white px-8 py-4 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              Try Live Demo <span>→</span>
            </Link>
          </div>
          <p className="text-sm text-slate-500">No credit card required • Full access to all features</p>
          
          {/* Hero Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <div className="text-2xl mb-1">📊</div>
              <div className="text-lg font-bold text-white">Portfolio Value</div>
              <div className="text-emerald-400 font-semibold">$847,892</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <div className="text-2xl mb-1">💵</div>
              <div className="text-lg font-bold text-white">Annual Income</div>
              <div className="text-emerald-400 font-semibold">$52,847</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <div className="text-2xl mb-1">📈</div>
              <div className="text-lg font-bold text-white">Success Rate</div>
              <div className="text-emerald-400 font-semibold">94.2%</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-lg font-bold text-white">Readiness Score</div>
              <div className="text-emerald-400 font-semibold">85/100</div>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl shadow-emerald-500/10">
              <Image
                src="/hero-image.png"
                alt="RetirePro Dashboard - Plan your retirement with confidence"
                width={1200}
                height={675}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg">Get started in minutes, not hours</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Enter Your Data</h3>
              <p className="text-slate-400">Input your current savings, income, expenses, and retirement goals. We&apos;ll do the heavy lifting.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Analyze & Plan</h3>
              <p className="text-slate-400">See your retirement projections, Social Security estimates, and income gap analysis in real-time.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Optimize & Grow</h3>
              <p className="text-slate-400">Use AI insights and Monte Carlo simulations to optimize your strategy and build confidence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Retire with Confidence</h2>
            <p className="text-slate-400 text-lg">Professional-grade tools designed for retirement planning</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '📊', title: 'Portfolio Tracking', desc: 'Track all your retirement accounts in one place. Real-time values, asset allocation, and growth tracking.' },
              { icon: '📈', title: 'Income Forecasting', desc: 'Project your retirement income 5, 10, or 30 years into the future with customizable assumptions.' },
              { icon: '🛡️', title: 'Monte Carlo Analysis', desc: 'Run thousands of simulations to understand your probability of success in any market condition.' },
              { icon: '🤖', title: 'AI Advisor', desc: 'Get personalized insights and recommendations powered by AI that understands your unique situation.' },
              { icon: '📅', title: 'Social Security Optimizer', desc: 'Find the optimal age to claim Social Security benefits and maximize your lifetime income.' },
              { icon: '🔍', title: 'Tax Strategy', desc: 'Analyze Roth conversions, tax-loss harvesting, and withdrawal strategies to minimize taxes.' },
            ].map((feature, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-emerald-500/50 transition-colors">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by Future Retirees</h2>
            <p className="text-slate-400 text-lg">See what our users are saying</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "Finally, a tool that actually understands retirement planning! The income forecasting helped me realize I can retire 3 years earlier.", name: "Sarah M.", role: "Early Retiree", stars: 5 },
              { quote: "The Monte Carlo simulations gave me the confidence I needed. Now I know my plan will survive any market downturn.", name: "Michael R.", role: "FIRE Enthusiast", stars: 5 },
              { quote: "I switched from spreadsheets to RetirePro and never looked back. The Social Security optimizer alone saved me $40k in lifetime benefits.", name: "Jennifer L.", role: "Financial Planner", stars: 5 },
            ].map((testimonial, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="text-yellow-400 mb-4">{'★'.repeat(testimonial.stars)}</div>
                <p className="text-slate-300 mb-6">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-slate-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-400 text-lg mb-8">Start free, upgrade when you&apos;re ready</p>
            
            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 bg-slate-900 rounded-full p-1">
              <button 
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-full transition-colors ${billingPeriod === 'monthly' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-full transition-colors ${billingPeriod === 'yearly' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
              >
                Yearly <span className="text-emerald-400 text-sm">Save 17%</span>
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <div className="text-4xl font-bold mb-1">$0<span className="text-lg text-slate-400 font-normal">/forever</span></div>
              <p className="text-sm text-slate-400 mb-4">Perfect for getting started</p>
              <ul className="space-y-3 my-6 text-slate-300">
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Basic retirement calculator</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Social Security estimator</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> 5-year projections</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Community support</li>
              </ul>
              <Link href="/app" className="block w-full text-center bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-slate-900/50 border-2 border-emerald-500 rounded-xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                Most Popular
              </div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-1">
                ${billingPeriod === 'monthly' ? '7' : '5'}
                <span className="text-lg text-slate-400 font-normal">/month</span>
              </div>
              <p className="text-sm text-slate-400 mb-4">For serious retirement planners</p>
              <ul className="space-y-3 my-6 text-slate-300">
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> All Free features</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Monte Carlo simulations</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> 30-year projections</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Tax optimization tools</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Net worth tracking</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Email support</li>
              </ul>
              <button 
                onClick={() => handleCheckout('pro')}
                disabled={isLoading === 'pro'}
                className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isLoading === 'pro' ? 'Loading...' : 'Get Pro'}
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-2">Premium</h3>
              <div className="text-4xl font-bold mb-1">
                ${billingPeriod === 'monthly' ? '12' : '10'}
                <span className="text-lg text-slate-400 font-normal">/month</span>
              </div>
              <p className="text-sm text-slate-400 mb-4">Maximum power & flexibility</p>
              <ul className="space-y-3 my-6 text-slate-300">
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> All Pro features</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> AI Retirement Advisor</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Estate planning tools</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Advanced scenarios</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Priority support</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Early access to features</li>
              </ul>
              <button 
                onClick={() => handleCheckout('premium')}
                disabled={isLoading === 'premium'}
                className="block w-full text-center bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isLoading === 'premium' ? 'Loading...' : 'Get Premium'}
              </button>
            </div>
          </div>

          {/* Compare Plans Table */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8">Compare Plans</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-4 px-4 font-medium text-slate-400">Feature</th>
                    <th className="text-center py-4 px-4 font-medium text-slate-400">Free</th>
                    <th className="text-center py-4 px-4 font-medium text-emerald-400">Pro</th>
                    <th className="text-center py-4 px-4 font-medium text-purple-400">Premium</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-800/50">
                    <td className="py-4 px-4">Retirement Projections</td>
                    <td className="text-center py-4 px-4">5 years</td>
                    <td className="text-center py-4 px-4">30 years</td>
                    <td className="text-center py-4 px-4">Unlimited</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="py-4 px-4">Monte Carlo Simulations</td>
                    <td className="text-center py-4 px-4">—</td>
                    <td className="text-center py-4 px-4 text-emerald-400">✓</td>
                    <td className="text-center py-4 px-4 text-emerald-400">✓</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="py-4 px-4">Social Security Calculator</td>
                    <td className="text-center py-4 px-4 text-emerald-400">✓</td>
                    <td className="text-center py-4 px-4 text-emerald-400">✓</td>
                    <td className="text-center py-4 px-4 text-emerald-400">✓</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="py-4 px-4">Tax Optimization Tools</td>
                    <td className="text-center py-4 px-4">—</td>
                    <td className="text-center py-4 px-4 text-emerald-400">✓</td>
                    <td className="text-center py-4 px-4 text-emerald-400">✓</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="py-4 px-4">Net Worth Tracking</td>
                    <td className="text-center py-4 px-4">—</td>
                    <td className="text-center py-4 px-4 text-emerald-400">✓</td>
                    <td className="text-center py-4 px-4 text-emerald-400">✓</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="py-4 px-4">AI Retirement Advisor</td>
                    <td className="text-center py-4 px-4">—</td>
                    <td className="text-center py-4 px-4">—</td>
                    <td className="text-center py-4 px-4 text-emerald-400">✓</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="py-4 px-4">Estate Planning Tools</td>
                    <td className="text-center py-4 px-4">—</td>
                    <td className="text-center py-4 px-4">—</td>
                    <td className="text-center py-4 px-4 text-emerald-400">✓</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="py-4 px-4">Support</td>
                    <td className="text-center py-4 px-4">Community</td>
                    <td className="text-center py-4 px-4">Email</td>
                    <td className="text-center py-4 px-4">Priority</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">🔒 Your Security is Our Priority</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <div className="text-3xl mb-2">🔐</div>
              <div className="font-semibold">256-bit SSL</div>
              <div className="text-sm text-slate-400">Bank-level encryption</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💳</div>
              <div className="font-semibold">Stripe</div>
              <div className="text-sm text-slate-400">PCI-DSS compliant</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="font-semibold">30-Day Guarantee</div>
              <div className="text-sm text-slate-400">Money-back promise</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🛡️</div>
              <div className="font-semibold">GDPR Ready</div>
              <div className="text-sm text-slate-400">Data protection</div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">🏦</div>
              <h3 className="font-semibold mb-2">Secure Payments</h3>
              <p className="text-sm text-slate-400">All payments processed by Stripe. We never see or store your card details.</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-semibold mb-2">Data Privacy</h3>
              <p className="text-sm text-slate-400">Your financial data is encrypted and private. We never sell your information.</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-semibold mb-2">Money-Back Guarantee</h3>
              <p className="text-sm text-slate-400">Not satisfied? Get a full refund within 30 days, no questions asked.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Plan Your Dream Retirement?</h2>
          <p className="text-xl text-slate-400 mb-8">Join thousands of smart planners securing their financial future.</p>
          <Link 
            href="/app" 
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-emerald-500/25"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">📧 Get Free Retirement Insights</h2>
          <p className="text-slate-400 mb-6">
            Weekly market analysis, retirement tips, and exclusive insights delivered to your inbox. 
            Join 5,000+ smart planners.
          </p>
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap">
              Subscribe Free →
            </button>
          </form>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-slate-500">
            <span>✓ Free forever</span>
            <span>✓ No spam</span>
            <span>✓ Unsubscribe anytime</span>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-lg">Got questions? We&apos;ve got answers.</p>
          </div>
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div 
                key={index} 
                className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-medium text-white">{faq.question}</span>
                  <span className={`text-emerald-400 transition-transform ${openFaq === index ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-slate-400">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💰</span>
                <span className="text-xl font-bold">RetirePro</span>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                Professional retirement planning tools for everyone. Plan your future with confidence.
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>✓ SSL Secured</span>
                <span>✓ 99.9% Uptime</span>
              </div>
            </div>
            
            {/* Product Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/app" className="hover:text-white transition-colors">Demo</Link></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            {/* Legal Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">© 2025 RetirePro. All rights reserved.</p>
            <p className="text-slate-600 text-xs text-center md:text-right">
              Disclaimer: Not financial advice. Consult a qualified financial advisor.
            </p>
          </div>
        </div>
      </footer>

      {/* Cookie Consent */}
      <CookieConsent />
    </div>
  );
}
