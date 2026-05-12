import React from 'react';

const SeverityBadge = ({ severity }) => {
  const classes = {
    low: 'badge-low',
    medium: 'badge-medium',
    high: 'badge-high',
  };
  return (
    <span className={classes[severity] || 'badge-medium'}>
      {severity?.charAt(0).toUpperCase() + severity?.slice(1)}
    </span>
  );
};

export default SeverityBadge;
