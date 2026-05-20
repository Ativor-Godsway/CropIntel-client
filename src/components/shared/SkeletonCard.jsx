import React from 'react';

const SkeletonCard = () => (
  <div className="card p-4 animate-pulse">
    <div className="rounded-lg h-48 mb-3" style={{ background: 'var(--bg-surface)' }} />
    <div className="rounded h-4 w-3/4 mb-2" style={{ background: 'var(--bg-surface)' }} />
    <div className="rounded h-3 w-1/2 mb-3" style={{ background: 'var(--bg-surface-2)' }} />
    <div className="rounded h-8 w-full" style={{ background: 'var(--bg-surface)' }} />
  </div>
);

export const SkeletonRow = () => (
  <div className="flex items-center gap-4 p-4 animate-pulse" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
    <div className="rounded-full h-10 w-10 flex-shrink-0" style={{ background: 'var(--bg-surface)' }} />
    <div className="flex-1 space-y-2">
      <div className="rounded h-4 w-1/2" style={{ background: 'var(--bg-surface)' }} />
      <div className="rounded h-3 w-1/3" style={{ background: 'var(--bg-surface-2)' }} />
    </div>
    <div className="rounded h-6 w-16" style={{ background: 'var(--bg-surface)' }} />
  </div>
);

export default SkeletonCard;
