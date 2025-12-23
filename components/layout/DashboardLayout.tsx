'use client';

import { ReactNode, useState, createContext, useContext } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

// Context for mobile sidebar state
interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within DashboardLayout');
  }
  return context;
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sidebarContext = {
    isOpen: isSidebarOpen,
    setIsOpen: setIsSidebarOpen,
    toggle: () => setIsSidebarOpen(prev => !prev),
  };

  return (
    <SidebarContext.Provider value={sidebarContext}>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area - responsive margin */}
        <div className="lg:ml-56 min-h-screen flex flex-col">
          {/* Top Bar */}
          <TopBar />

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
