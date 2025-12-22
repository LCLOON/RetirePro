'use client';

import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  hint?: string;
  options: Option[];
  placeholder?: string;
  icon?: ReactNode;
  onChange: (value: string) => void;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, icon, className = '', onChange, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-300 mb-1">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              {icon}
            </div>
          )}
          <select
            ref={ref}
            className={`
              w-full px-4 py-2.5 rounded-lg border transition-colors duration-200
              appearance-none bg-slate-800 text-white cursor-pointer
              ${icon ? 'pl-10' : ''}
              ${error 
                ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/30' 
                : 'border-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30'
              }
              disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed
              ${className}
            `}
            onChange={(e) => onChange(e.target.value)}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-slate-400">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

interface RadioGroupProps {
  label?: string;
  options: Option[];
  value: string | number;
  onChange: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function RadioGroup({ 
  label, 
  options, 
  value, 
  onChange, 
  orientation = 'horizontal',
  className = '' 
}: RadioGroupProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className={`flex ${orientation === 'vertical' ? 'flex-col gap-2' : 'flex-wrap gap-4'}`}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`
              flex items-center gap-2 cursor-pointer
              ${value === option.value ? 'text-emerald-400' : 'text-slate-300'}
            `}
          >
            <input
              type="radio"
              checked={value === option.value}
              onChange={() => onChange(String(option.value))}
              className="w-4 h-4 text-emerald-500 bg-slate-800 border-slate-600 focus:ring-emerald-500"
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ label, checked, onChange, disabled, className = '' }: CheckboxProps) {
  return (
    <label className={`flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-5 h-5 text-emerald-500 bg-slate-800 border-slate-600 rounded focus:ring-emerald-500 focus:ring-2 focus:ring-offset-0"
      />
      <span className="text-sm text-slate-300">{label}</span>
    </label>
  );
}
