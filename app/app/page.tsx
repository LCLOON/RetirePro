'use client';

import { AppProvider } from '@/lib/store';
import { Dashboard } from '@/components/Dashboard';

export default function AppPage() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}
