import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'webinar' | 'meeting';
}

export function Card({
  children,
  className = '',
  variant = 'default',
  ...props
}: CardProps) {
  const variantStyles = {
    default: 'bg-slate-900/90 border-slate-800 hover:border-slate-700',
    webinar: 'bg-slate-900/90 border-indigo-900/40 hover:border-indigo-600/50 shadow-sm shadow-indigo-950/30',
    meeting: 'bg-slate-900/90 border-teal-900/40 hover:border-teal-600/50 shadow-sm shadow-teal-950/30',
  }[variant];

  return (
    <div
      className={`rounded-xl border backdrop-blur-sm p-6 transition-all duration-200 ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
