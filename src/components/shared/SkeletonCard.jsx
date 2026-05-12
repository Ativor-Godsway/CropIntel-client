import React from 'react';

const SkeletonCard = () => (
  <div className="card p-4 animate-pulse">
    <div className="bg-gray-200 rounded-lg h-48 mb-3" />
    <div className="bg-gray-200 rounded h-4 w-3/4 mb-2" />
    <div className="bg-gray-200 rounded h-3 w-1/2 mb-3" />
    <div className="bg-gray-200 rounded h-8 w-full" />
  </div>
);

export const SkeletonRow = () => (
  <div className="flex items-center gap-4 p-4 border-b border-gray-100 animate-pulse">
    <div className="bg-gray-200 rounded-full h-10 w-10 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="bg-gray-200 rounded h-4 w-1/2" />
      <div className="bg-gray-200 rounded h-3 w-1/3" />
    </div>
    <div className="bg-gray-200 rounded h-6 w-16" />
  </div>
);

export default SkeletonCard;
