'use client';

import dynamic from 'next/dynamic';
import { useApp } from '@/lib/store';
import { SubscriptionProvider } from '@/lib/subscription';
import { DashboardLayout } from '@/components/layout';
import { FeatureGate } from '@/components/ui/FeatureGate';

// Static imports for lightweight/frequently-used tabs
import {
  StartTab,
  DataTab,
  ResultsTab,
  SocialSecurityTab,
  AboutTab,
  SettingsTab,
  HelpTab,
} from '@/components/tabs';

// Loading spinner component for lazy-loaded tabs
function TabLoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-slate-400">Loading...</p>
      </div>
    </div>
  );
}

// Dynamic imports for heavy tabs (Recharts, complex forms)
// This reduces initial bundle by ~700KB
const ChartsTab = dynamic(
  () => import('@/components/tabs/ChartsTab').then(m => ({ default: m.ChartsTab })),
  { loading: () => <TabLoadingSpinner />, ssr: false }
);

const BudgetTab = dynamic(
  () => import('@/components/tabs/BudgetTab').then(m => ({ default: m.BudgetTab })),
  { loading: () => <TabLoadingSpinner />, ssr: false }
);

const NetWorthTab = dynamic(
  () => import('@/components/tabs/NetWorthTab').then(m => ({ default: m.NetWorthTab })),
  { loading: () => <TabLoadingSpinner />, ssr: false }
);

const MortgageTab = dynamic(
  () => import('@/components/tabs/MortgageTab').then(m => ({ default: m.MortgageTab })),
  { loading: () => <TabLoadingSpinner />, ssr: false }
);

const AnalysisTab = dynamic(
  () => import('@/components/tabs/AnalysisTab').then(m => ({ default: m.AnalysisTab })),
  { loading: () => <TabLoadingSpinner />, ssr: false }
);

const DetailsTab = dynamic(
  () => import('@/components/tabs/DetailsTab').then(m => ({ default: m.DetailsTab })),
  { loading: () => <TabLoadingSpinner />, ssr: false }
);

const TaxTab = dynamic(
  () => import('@/components/tabs/TaxTab').then(m => ({ default: m.TaxTab })),
  { loading: () => <TabLoadingSpinner />, ssr: false }
);

const AdvancedTab = dynamic(
  () => import('@/components/tabs/AdvancedTab').then(m => ({ default: m.AdvancedTab })),
  { loading: () => <TabLoadingSpinner />, ssr: false }
);

const LegalTab = dynamic(
  () => import('@/components/tabs/LegalTab').then(m => ({ default: m.LegalTab })),
  { loading: () => <TabLoadingSpinner />, ssr: false }
);

const AITab = dynamic(
  () => import('@/components/tabs/AITab').then(m => ({ default: m.AITab })),
  { loading: () => <TabLoadingSpinner />, ssr: false }
);

function DashboardContent() {
  const { state } = useApp();
  
  const renderTab = () => {
    switch (state.activeTab) {
      case 'start':
        return <StartTab />;
      case 'data':
        return <DataTab />;
      case 'results':
        return <ResultsTab />;
      case 'charts':
        return (
          <FeatureGate featureId="charts">
            <ChartsTab />
          </FeatureGate>
        );
      case 'analysis':
        return (
          <FeatureGate featureId="analysis">
            <AnalysisTab />
          </FeatureGate>
        );
      case 'details':
        return (
          <FeatureGate featureId="details">
            <DetailsTab />
          </FeatureGate>
        );
      case 'mortgage':
        return (
          <FeatureGate featureId="mortgage">
            <MortgageTab />
          </FeatureGate>
        );
      case 'worth':
        return (
          <FeatureGate featureId="worth">
            <NetWorthTab />
          </FeatureGate>
        );
      case 'budget':
        return (
          <FeatureGate featureId="budget">
            <BudgetTab />
          </FeatureGate>
        );
      case 'social':
        return <SocialSecurityTab />;
      case 'tax':
        return (
          <FeatureGate featureId="tax">
            <TaxTab />
          </FeatureGate>
        );
      case 'advanced':
        return (
          <FeatureGate featureId="advanced">
            <AdvancedTab />
          </FeatureGate>
        );
      case 'legal':
        return (
          <FeatureGate featureId="legal">
            <LegalTab />
          </FeatureGate>
        );
      case 'ai':
        return (
          <FeatureGate featureId="ai">
            <AITab />
          </FeatureGate>
        );
      case 'about':
        return <AboutTab />;
      case 'settings':
        return <SettingsTab />;
      case 'help':
        return <HelpTab />;
      default:
        return <StartTab />;
    }
  };
  
  return (
    <DashboardLayout>
      {renderTab()}
    </DashboardLayout>
  );
}

export function Dashboard() {
  return (
    <SubscriptionProvider>
      <DashboardContent />
    </SubscriptionProvider>
  );
}
