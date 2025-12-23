'use client';

import { ReactNode } from 'react';
import type { TabId, Tab } from '@/lib/types';

interface TabsProps {
  tabs: Tab[];
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  variant?: 'horizontal' | 'vertical';
  className?: string;
}

export function Tabs({ 
  tabs, 
  activeTab, 
  onTabChange, 
  variant = 'horizontal',
  className = '' 
}: TabsProps) {
  if (variant === 'vertical') {
    return (
      <nav className={`flex flex-col space-y-1 ${className}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg text-left
              transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-medium'
                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            {tab.icon && <span className="w-5 h-5">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    );
  }
  
  return (
    <div className={`border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <nav className="flex gap-1 overflow-x-auto scrollbar-hide px-2 -mb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium
              border-b-2 transition-all duration-200 whitespace-nowrap
              ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

interface TabPanelProps {
  children: ReactNode;
  className?: string;
}

export function TabPanel({ children, className = '' }: TabPanelProps) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

interface TabContentProps {
  activeTab: TabId;
  children: { [key in TabId]?: ReactNode };
}

export function TabContent({ activeTab, children }: TabContentProps) {
  return <>{children[activeTab] || null}</>;
}
