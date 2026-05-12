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

  const handleCheckout = () => {
    if (!user) return navigate('/login');
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Browse the marketplace to add products."
          action={<Link to="/marketplace" className="btn-primary">Browse Products</Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Shopping Cart</h1>
        <button onClick={clearCart} className="text-xs text-red-500 hover:underline">
          Clear cart
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {items.map(({ product, quantity }) => (
          <div key={product._id} className="card flex items-center gap-4 p-4">
            {/* Image */}
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🌿</div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
              <p className="text-xs text-gray-400 capitalize">{product.category}</p>
              <p className="text-sm font-bold text-primary-600 mt-0.5">{formatCurrency(product.price)}</p>
            </div>

            {/* Quantity controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => updateQuantity(product._id, quantity - 1)}
                  className="px-2 py-1 text-gray-500 hover:bg-gray-100 text-sm"
                >−</button>
                <span className="px-3 text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => updateQuantity(product._id, quantity + 1)}
                  className="px-2 py-1 text-gray-500 hover:bg-gray-100 text-sm"
                >+</button>
              </div>
              <button
                onClick={() => removeItem(product._id)}
                className="text-gray-300 hover:text-red-500 transition-colors ml-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Line total */}
            <div className="text-right min-w-[60px]">
              <p className="text-sm font-bold text-gray-800">{formatCurrency(product.price * quantity)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Order summary */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-800 mb-3">Order Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span className="text-green-600 font-medium">Free</span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span className="text-primary-600">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
        <button onClick={handleCheckout} className="btn-primary w-full mt-4 py-3 text-base">
          Proceed to Checkout →
        </button>
        <Link to="/marketplace" className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-3">
          ← Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default Cart;
