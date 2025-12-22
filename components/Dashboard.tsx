'use client';

import { useApp } from '@/lib/store';
import { DashboardLayout } from '@/components/layout';
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

export function Dashboard() {
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
        return <ChartsTab />;
      case 'analysis':
        return <AnalysisTab />;
      case 'details':
        return <DetailsTab />;
      case 'mortgage':
        return <MortgageTab />;
      case 'worth':
        return <NetWorthTab />;
      case 'budget':
        return <BudgetTab />;
      case 'social':
        return <SocialSecurityTab />;
      case 'tax':
        return <TaxTab />;
      case 'advanced':
        return <AdvancedTab />;
      case 'legal':
        return <LegalTab />;
      case 'ai':
        return <AITab />;
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
