'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'retirepro_cookie_consent';

interface CookiePreferences {
  essential: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
}

export function getCookieConsent(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    // Legacy format - convert
    if (stored === 'all') return { essential: true, analytics: true, marketing: true };
    if (stored === 'essential') return { essential: true, analytics: false, marketing: false };
    return null;
  }
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent) {
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
    setShowBanner(false);
    setShowPreferences(false);
  };

  const acceptAll = () => {
    savePreferences({ essential: true, analytics: true, marketing: true });
  };

  const acceptEssential = () => {
    savePreferences({ essential: true, analytics: false, marketing: false });
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-slate-900 border-t border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto">
        {!showPreferences ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl" role="img" aria-label="Cookie">🍪</span>
              <div>
                <p className="font-medium text-white">We value your privacy.</p>
                <p className="text-sm text-slate-400">
                  We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                  By clicking &quot;Accept All&quot;, you consent to our use of cookies. 
                  Read our <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300 underline">Privacy Policy</Link> for more information.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setShowPreferences(true)}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                aria-label="Customize cookie preferences"
              >
                Customize
              </button>
              <button
                onClick={acceptEssential}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-colors"
                aria-label="Accept essential cookies only"
              >
                Essential Only
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                aria-label="Accept all cookies"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Cookie Preferences</h3>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-slate-400 hover:text-white"
                aria-label="Close preferences"
              >
                ✕
              </button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              {/* Essential - Always On */}
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">Essential</span>
                  <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Always On</span>
                </div>
                <p className="text-sm text-slate-400">Required for the website to function. Cannot be disabled.</p>
              </div>
              
              {/* Analytics */}
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">Analytics</span>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                    className={`w-12 h-6 rounded-full transition-colors ${preferences.analytics ? 'bg-emerald-600' : 'bg-slate-600'}`}
                    role="switch"
                    aria-checked={preferences.analytics}
                    aria-label="Toggle analytics cookies"
                  >
                    <span className={`block w-5 h-5 bg-white rounded-full transform transition-transform ${preferences.analytics ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                <p className="text-sm text-slate-400">Help us understand how visitors interact with our website.</p>
              </div>
              
              {/* Marketing */}
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">Marketing</span>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                    className={`w-12 h-6 rounded-full transition-colors ${preferences.marketing ? 'bg-emerald-600' : 'bg-slate-600'}`}
                    role="switch"
                    aria-checked={preferences.marketing}
                    aria-label="Toggle marketing cookies"
                  >
                    <span className={`block w-5 h-5 bg-white rounded-full transform transition-transform ${preferences.marketing ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                <p className="text-sm text-slate-400">Used to show you relevant ads and measure their effectiveness.</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={acceptEssential}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={saveCustomPreferences}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
