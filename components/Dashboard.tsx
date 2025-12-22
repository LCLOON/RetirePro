'use client';

import { useApp } from '@/lib/store';
import { SubscriptionProvider } from '@/lib/subscription';
import { DashboardLayout } from '@/components/layout';
import { FeatureGate } from '@/components/ui/FeatureGate';
import {
  StartTab,
  DataTab,
  ResultsTab,
  ChartsTab,
  AnalysisTab,
  DetailsTab,
  MortgageTab,
  NetWorthTab,
  BudgetTab,
  SocialSecurityTab,
  TaxTab,
  AdvancedTab,
  LegalTab,
  AITab,
  AboutTab,
  SettingsTab,
  HelpTab,
} from '@/components/tabs';

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
