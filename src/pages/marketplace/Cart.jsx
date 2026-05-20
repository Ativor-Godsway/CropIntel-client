import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';
import EmptyState from '../../components/shared/EmptyState';

const Cart = () => {
  const { items, removeItem, updateQuantity, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => { if (!user) return navigate('/login'); navigate('/checkout'); };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <EmptyState icon="🛒" title="Your cart is empty" description="Browse the marketplace to add products." action={<Link to="/marketplace" className="btn-primary">Browse Products</Link>} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-theme-text">Shopping Cart</h1>
        <button onClick={clearCart} className="text-xs text-theme-red hover:underline">Clear cart</button>
      </div>

      <div className="space-y-3 mb-6">
        {items.map(({ product, quantity }) => (
          <div key={product._id} className="card flex items-center gap-4 p-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'var(--bg-surface)' }}>
              {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🌿</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-theme-text truncate">{product.name}</p>
              <p className="text-xs text-theme-40 capitalize">{product.category}</p>
              <p className="text-sm font-bold text-theme-green mt-0.5">{formatCurrency(product.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
                <button onClick={() => updateQuantity(product._id, quantity - 1)} className="px-2 py-1 text-theme-muted hover:bg-theme-surface text-sm transition-colors">−</button>
                <span className="px-3 text-sm font-medium text-theme-text">{quantity}</span>
                <button onClick={() => updateQuantity(product._id, quantity + 1)} className="px-2 py-1 text-theme-muted hover:bg-theme-surface text-sm transition-colors">+</button>
              </div>
              <button onClick={() => removeItem(product._id)} className="text-theme-hint hover:text-theme-red transition-colors ml-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <div className="text-right min-w-[60px]">
              <p className="text-sm font-bold text-theme-text">{formatCurrency(product.price * quantity)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-theme-text mb-3">Order Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-theme-muted">
            <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between text-theme-muted">
            <span>Shipping</span>
            <span className="text-theme-green font-medium">Free</span>
          </div>
          <div className="flex justify-between font-bold text-theme-text pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <span>Total</span>
            <span className="text-theme-green">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
        <button onClick={handleCheckout} className="btn-primary w-full mt-4 py-3 text-base rounded-xl">Proceed to Checkout →</button>
        <Link to="/marketplace" className="block text-center text-sm text-theme-dim hover:text-theme-muted mt-3 transition-colors">← Continue Shopping</Link>
      </div>
    </div>
  );
};

export default Cart;
