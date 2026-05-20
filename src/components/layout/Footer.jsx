import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={{ borderTop: '1px solid var(--border-subtle)' }}>
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <span className="font-display text-lg font-light text-theme-hint">CropIntel</span>
        <div className="flex items-center gap-6 text-xs text-theme-dim">
          {['Privacy','Terms','Support','Contact'].map((l) => (
            <Link key={l} to="/" className="hover:text-theme-text transition-colors">{l}</Link>
          ))}
        </div>
        <p className="text-xs text-theme-faint">© {new Date().getFullYear()} CropIntel. Built in Ghana.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
