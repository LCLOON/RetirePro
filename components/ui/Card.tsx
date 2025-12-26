'use client';

import { ReactNode } from 'react';
import { useApp } from '@/lib/store';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: string;
  action?: ReactNode;
  noPadding?: boolean;
  noWrapper?: boolean; // Don't wrap children in a div
}

// Theme colors
const cardThemes = {
  light: { bg: '#ffffff', border: '#e2e8f0', text: '#0f172a', muted: '#64748b' },
  dark: { bg: 'rgba(30, 41, 59, 0.5)', border: 'rgba(51, 65, 85, 0.5)', text: '#f1f5f9', muted: '#94a3b8' },
  medium: { bg: '#f0f9ff', border: '#bae6fd', text: '#0c4a6e', muted: '#0369a1' },
};

export function Card({ 
  children, 
  className = '', 
  title, 
  subtitle,
  icon,
  action,
  noPadding = false,
  noWrapper = false 
}: CardProps) {
  const { state } = useApp();
  const theme = cardThemes[state.theme];
  const titleId = title ? `card-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : undefined;

  return (
    <div 
      className={`backdrop-blur-sm rounded-xl shadow-lg ${className}`}
      style={{ backgroundColor: theme.bg, borderWidth: 1, borderStyle: 'solid', borderColor: theme.border }}
      role="region"
      aria-labelledby={titleId}
    >
      {(title || action) && (
        <div 
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: theme.border }}
        >
          <div className="flex items-center gap-2">
            {icon && <span className="text-xl" aria-hidden="true">{icon}</span>}
            <div>
              {title && <h3 id={titleId} className="text-base font-semibold" style={{ color: theme.text }}>{title}</h3>}
              {subtitle && <p className="text-xs mt-0.5" style={{ color: theme.muted }}>{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {noWrapper ? (
        children
      ) : (
        <div className={noPadding ? '' : 'p-5'}>
          {children}
        </div>
      )}
    </div>
  );
}

interface CardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function CardGrid({ children, columns = 3, className = '' }: CardGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };
  
  return (
    <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'emerald' | 'blue' | 'purple' | 'amber' | 'red' | 'slate' | 'green';
  className?: string;
}

export function StatCard({ 
  label, 
  value, 
  subValue,
  subtitle, 
  icon, 
  trend, 
  trendValue,
  color = 'emerald',
  className = '' 
}: StatCardProps) {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-slate-400',
  };

  const iconBgColors: Record<string, string> = {
    emerald: 'bg-emerald-500/20 text-emerald-400',
    blue: 'bg-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400',
    amber: 'bg-amber-500/20 text-amber-400',
    red: 'bg-red-500/20 text-red-400',
    slate: 'bg-slate-500/20 text-slate-400',
    green: 'bg-emerald-500/20 text-emerald-400',
  };

  const borderColors: Record<string, string> = {
    emerald: 'border-l-emerald-500',
    blue: 'border-l-blue-500',
    purple: 'border-l-purple-500',
    amber: 'border-l-amber-500',
    red: 'border-l-red-500',
    slate: 'border-l-slate-500',
    green: 'border-l-emerald-500',
  };
  
  return (
    <div 
      className={`bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 border-l-4 ${borderColors[color]} p-4 ${className}`}
      role="group"
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-start justify-between gap-3">
        {icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${iconBgColors[color]}`} aria-hidden="true">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-400 truncate">{label}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          <p className="text-xl font-bold text-white mt-0.5">{value}</p>
          {subValue && <p className="text-xs text-slate-400 mt-0.5">{subValue}</p>}
          {trend && trendValue && (
            <p className={`text-xs font-medium mt-1 ${trendColors[trend]}`}>
              <span aria-hidden="true">{trend === 'up' && '↑ '}{trend === 'down' && '↓ '}</span>
              <span className="sr-only">{trend === 'up' ? 'Trending up: ' : trend === 'down' ? 'Trending down: ' : ''}</span>
              {trendValue}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
