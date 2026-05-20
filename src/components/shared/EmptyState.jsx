import React from 'react';

const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
    {icon && <div className="text-5xl mb-4">{icon}</div>}
    <h3 className="text-lg font-semibold text-cream mb-1">{title}</h3>
    {description && <p className="text-sm text-cream/50 max-w-sm mb-4">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
