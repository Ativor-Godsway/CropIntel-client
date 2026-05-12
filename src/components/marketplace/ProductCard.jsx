import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

const CATEGORY_COLORS = {
  fertilizer: 'bg-green-100 text-green-700',
  pesticide: 'bg-red-100 text-red-700',
  seed: 'bg-amber-100 text-amber-700',
  tool: 'bg-blue-100 text-blue-700',
  other: 'bg-gray-100 text-gray-700',
};

const ProductCard = ({ product }) => {
  const { addItem, items } = useCart();
  const toast = useToast();
  const inCart = items.some((i) => i.product._id === product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Link to={`/marketplace/${product._id}`} className="card flex flex-col hover:shadow-md transition-shadow group">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-100 h-44">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🌿</div>
        )}
        <span className={`absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[product.category]}`}>
          {product.category}
        </span>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-500">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>
        {product.seller?.sellerProfile?.businessName && (
          <p className="text-xs text-gray-400 mb-2">{product.seller.sellerProfile.businessName}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-base font-bold text-primary-600">{formatCurrency(product.price)}</span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
              ${inCart
                ? 'bg-primary-100 text-primary-700 border border-primary-200'
                : 'bg-primary-600 text-white hover:bg-primary-700'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {inCart ? '✓ In Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
