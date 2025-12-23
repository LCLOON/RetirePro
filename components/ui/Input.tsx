'use client';

import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefix, suffix, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-500">
              {icon}
            </div>
          )}
          {prefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 text-sm">
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-2.5 rounded-lg border transition-colors duration-200
              bg-white dark:bg-slate-800 text-gray-900 dark:text-white
              ${icon ? 'pl-10' : ''}
              ${prefix ? 'pl-8' : ''}
              ${suffix ? 'pr-12' : ''}
              ${error 
                ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/30' 
                : 'border-gray-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30'
              }
              placeholder:text-gray-400 dark:placeholder:text-slate-500
              disabled:bg-gray-100 dark:disabled:bg-slate-700 disabled:text-gray-500 dark:disabled:text-slate-500 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 text-sm">
              {suffix}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface NumberInputProps extends Omit<InputProps, 'type' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  helpText?: string;
}

export function NumberInput({ 
  value, 
  onChange, 
  min, 
  max, 
  step = 1,
  helpText,
  ...props 
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      if (min !== undefined && val < min) onChange(min);
      else if (max !== undefined && val > max) onChange(max);
      else onChange(val);
    }
  };
  
  return (
    <Input
      type="number"
      value={value}
      onChange={handleChange}
      min={min}
      max={max}
      step={step}
      hint={helpText}
      {...props}
    />
  );
}

interface CurrencyInputProps extends Omit<InputProps, 'type' | 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
  helpText?: string;
}

export function CurrencyInput({ value, onChange, helpText, ...props }: CurrencyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters except decimal
    const cleaned = e.target.value.replace(/[^0-9.]/g, '');
    const val = parseFloat(cleaned);
    if (!isNaN(val)) {
      onChange(val);
    } else if (cleaned === '') {
      onChange(0);
    }
  };
  
  return (
    <Input
      type="text"
      value={value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      onChange={handleChange}
      prefix="$"
      hint={helpText}
      {...props}
    />
  );
}

interface PercentInputProps extends Omit<InputProps, 'type' | 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
  asDecimal?: boolean; // if true, value is stored as decimal (0.07), displayed as percent (7)
  helpText?: string;
}

export function PercentInput({ value, onChange, asDecimal = true, helpText, ...props }: PercentInputProps) {
  const displayValue = asDecimal ? value * 100 : value;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onChange(asDecimal ? val / 100 : val);
    }
  };
  
  return (
    <Input
      type="number"
      value={displayValue.toFixed(asDecimal ? 1 : 0)}
      onChange={handleChange}
      suffix="%"
      step={asDecimal ? 0.1 : 1}
      hint={helpText}
      {...props}
    />
  );
}

// Text input with controlled value
interface TextInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
}

export function TextInput({ value, onChange, ...props }: TextInputProps) {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
}

// Select wrapper with simpler interface
interface SelectInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}

export function SelectInput({ label, value, onChange, options, hint }: SelectInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border transition-colors duration-200
            appearance-none bg-slate-800 text-white cursor-pointer
            border-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
        >
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
      {hint && <p className="mt-1 text-sm text-slate-400">{hint}</p>}
    </div>
  );
}
