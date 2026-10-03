import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export const Loading: React.FC<LoadingProps> = ({ size = 'md', text, fullPage }) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeMap[size]} animate-spin text-primary-400`} />
      {text && <p className="text-slate-400 text-sm">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    {icon && (
      <div className="mb-4 text-slate-600">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
    {description && <p className="text-slate-500 text-sm mb-6 max-w-sm">{description}</p>}
    {action}
  </div>
);

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An error occurred. Please try again.',
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-12 h-12 rounded-full bg-red-950 flex items-center justify-center mb-4">
      <span className="text-red-400 text-xl">!</span>
    </div>
    <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm mb-6 max-w-sm">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-secondary">
        Try Again
      </button>
    )}
  </div>
);
