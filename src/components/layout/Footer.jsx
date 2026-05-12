import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16A8 8 0 0010 2z" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg">Farmly</span>
          </div>
          <p className="text-sm text-gray-400">AI-powered crop disease diagnosis for Ghanaian farmers.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/diagnosis" className="hover:text-white transition-colors">Diagnose</Link></li>
            <li><Link to="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
            <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Sellers</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/seller" className="hover:text-white transition-colors">Seller Hub</Link></li>
            <li><Link to="/seller/list" className="hover:text-white transition-colors">List a Product</Link></li>
            <li><Link to="/seller/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><span className="text-gray-400">support@farmly.gh</span></li>
            <li><span className="text-gray-400">Ghana, West Africa</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Farmly. All rights reserved. Built for Ghanaian farmers.
      </div>
    </div>
  </footer>
);

export default Footer;
