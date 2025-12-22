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
          <label className="block text-sm font-medium text-slate-300 mb-1">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              {icon}
            </div>
          )}
          {prefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-2.5 rounded-lg border transition-colors duration-200
              bg-slate-800 text-white
              ${icon ? 'pl-10' : ''}
              ${prefix ? 'pl-8' : ''}
              ${suffix ? 'pr-12' : ''}
              ${error 
                ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/30' 
                : 'border-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30'
              }
              placeholder:text-slate-500
              disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              {suffix}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-slate-400">{hint}</p>}
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
