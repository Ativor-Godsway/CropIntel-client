import React from 'react';

// Maps both the old (low/medium/high) and new (Mild/Moderate/Severe) values
// to the shared CSS badge classes defined in index.css.
const CLASS_MAP = {
  low:      'badge-low',
  medium:   'badge-medium',
  high:     'badge-high',
  Mild:     'badge-low',
  Moderate: 'badge-medium',
  Severe:   'badge-high',
};

const SeverityBadge = ({ severity }) => (
  <span className={CLASS_MAP[severity] || 'badge-medium'}>
    {severity?.charAt(0).toUpperCase() + severity?.slice(1)}
  </span>
);

export default SeverityBadge;
