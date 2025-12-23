'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'pro';
  const sessionId = searchParams.get('session_id');
  
  // Derive tier directly from plan - no need for state
  const tier: 'pro' | 'premium' = plan === 'premium' ? 'premium' : 'pro';

  useEffect(() => {
    // Store the subscription tier in localStorage
    localStorage.setItem('retirepro_subscription_tier', tier);
  }, [tier]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
          <span className="text-5xl">✓</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-4">
          Welcome to RetirePro {tier === 'premium' ? 'Premium' : 'Pro'}! 🎉
        </h1>
        
        <p className="text-slate-400 text-lg mb-8">
          Your subscription has been activated successfully. You now have access to all 
          {tier === 'premium' ? ' premium' : ' pro'} features.
        </p>

        {/* Features Unlocked */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-emerald-400 mb-4">
            Features Unlocked:
          </h3>
          <ul className="space-y-2">
            {tier === 'premium' ? (
              <>
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  AI Retirement Advisor
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  Estate Planning Tools
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  Advanced Scenarios
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  Priority Support
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  All Pro Features
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  Monte Carlo Simulations
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  30-Year Projections
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  Tax Optimization
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  Advanced Charts
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  Net Worth Tracking
                </li>
              </>
            )}
          </ul>
        </div>

        {/* CTA */}
        <Link
          href="/app"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-medium transition-colors text-lg"
        >
          Start Using RetirePro
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        {/* Session info (for debugging) */}
        {sessionId && (
          <p className="text-xs text-slate-600 mt-8">
            Session: {sessionId.substring(0, 20)}...
          </p>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Processing your subscription...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
