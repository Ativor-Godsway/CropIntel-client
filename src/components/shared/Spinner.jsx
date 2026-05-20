import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div
      className={`animate-spin rounded-full border-2 ${sizes[size]} ${className}`}
      style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--green-bright)' }}
    />
  );
};

export const PageSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Spinner size="lg" />
  </div>
);
