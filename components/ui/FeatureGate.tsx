'use client';

import { useSubscription, TIER_INFO, PRO_FEATURES, PREMIUM_FEATURES, SubscriptionTier } from '@/lib/subscription';
import Link from 'next/link';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredTier: SubscriptionTier;
  featureName: string;
}

export function UpgradeModal({ isOpen, onClose, requiredTier, featureName }: UpgradeModalProps) {
  if (!isOpen) return null;

  const tierInfo = TIER_INFO[requiredTier];
  const features = requiredTier === 'premium' ? PREMIUM_FEATURES : PRO_FEATURES;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 text-center border-b border-slate-800">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Upgrade to {tierInfo.name}</h2>
          <p className="text-slate-400">
            <span className="font-semibold text-white">{featureName}</span> requires a {tierInfo.name} subscription
          </p>
        </div>

        {/* Features */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4">
            What&apos;s included in {tierInfo.name}:
          </h3>
          <ul className="space-y-3">
            {features.slice(0, 6).map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-300">
                <span className="text-emerald-400">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Price and CTA */}
        <div className="p-6 bg-slate-800/50">
          <div className="text-center mb-4">
            <span className="text-4xl font-bold text-white">
              {requiredTier === 'pro' ? '$9' : '$19'}
            </span>
            <span className="text-slate-400">/month</span>
            <div className="text-sm text-emerald-400 mt-1">Save 17% with yearly billing</div>
          </div>
          
          <Link
            href="/#pricing"
            className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mb-3"
          >
            Upgrade to {tierInfo.name}
          </Link>
          
          <button
            onClick={onClose}
            className="block w-full text-center text-slate-400 hover:text-white py-2 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

interface FeatureGateProps {
  featureId: string;
  children: React.ReactNode;
}

export function FeatureGate({ featureId, children }: FeatureGateProps) {
  const { canAccess, getRequiredTierForFeature, tier } = useSubscription();

  if (canAccess(featureId)) {
    return <>{children}</>;
  }

  const requiredTier = getRequiredTierForFeature(featureId);
  const tierInfo = TIER_INFO[requiredTier];
  const features = requiredTier === 'premium' ? PREMIUM_FEATURES : PRO_FEATURES;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="text-center max-w-lg">
        {/* Lock Icon */}
        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">🔒</span>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold mb-3">
          {requiredTier === 'premium' ? 'Premium' : 'Pro'} Feature
        </h2>
        <p className="text-slate-400 text-lg mb-8">
          This feature is available with RetirePro {tierInfo.name}
        </p>

        {/* Feature Preview */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-emerald-400 mb-4">
            Unlock {tierInfo.name} to get:
          </h3>
          <ul className="space-y-2">
            {features.slice(0, 5).map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-slate-300">
                <span className="text-emerald-400">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <Link
          href="/#pricing"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
        >
          Upgrade to {tierInfo.name}
          <span className="text-slate-300">{tierInfo.price}</span>
        </Link>

        {/* Current plan indicator */}
        <p className="text-sm text-slate-500 mt-4">
          Current plan: <span className={TIER_INFO[tier].color}>{TIER_INFO[tier].name}</span>
        </p>
      </div>
    </div>
  );
}

// Small badge showing tier requirement
export function TierBadge({ tier }: { tier: SubscriptionTier }) {
  if (tier === 'free') return null;
  
  const info = TIER_INFO[tier];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${info.badge}`}>
      {info.name}
    </span>
  );
}

// Lock icon for sidebar
export function LockIcon({ tier }: { tier: SubscriptionTier }) {
  if (tier === 'free') return null;
  
  return (
    <span className="text-xs opacity-60" title={`Requires ${TIER_INFO[tier].name}`}>
      {tier === 'premium' ? '💎' : '⭐'}
    </span>
  );
}
