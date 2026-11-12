import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'warning' | 'success' | 'destructive' | 'outline';
  className?: string;
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  variant = 'default',
  className = '',
  size = 'md',
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-colors';
  
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  const variantClasses = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700',
    primary: 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/60',
    secondary: 'bg-teal-950/80 text-teal-300 border border-teal-700/60',
    warning: 'bg-amber-950/70 text-amber-300 border border-amber-700/60',
    success: 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/60',
    destructive: 'bg-rose-950/70 text-rose-300 border border-rose-700/60',
    outline: 'border border-slate-600 text-slate-300',
  }[variant];

  return (
    <span className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
}
