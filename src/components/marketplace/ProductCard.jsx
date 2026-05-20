import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

const CATEGORY_COLORS = {
  fertilizer: { bg: 'var(--surface-accent)',    color: 'var(--green-bright)' },
  pesticide:  { bg: 'var(--surface-red)',        color: 'var(--red-text)'    },
  seed:       { bg: 'var(--surface-gold)',       color: 'var(--gold)'        },
  tool:       { bg: 'var(--surface-blue)',       color: '#60a5fa'            },
  other:      { bg: 'var(--bg-surface)',         color: 'var(--text-muted)'  },
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

  const cat = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.other;

  return (
    <Link to={`/marketplace/${product._id}`} className="flex flex-col rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 group" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
      <div className="relative overflow-hidden h-44" style={{ background: 'var(--bg-surface)' }}>
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🌿</div>
        )}
        <span className="absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: cat.bg, color: cat.color }}>
          {product.category}
        </span>
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--overlay-bg)' }}>
            <span className="text-sm font-semibold text-theme-muted">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-theme-text line-clamp-2 mb-1 group-hover:text-theme-green transition-colors">{product.name}</h3>
        {product.seller?.sellerProfile?.businessName && (
          <p className="text-xs text-theme-40 mb-2">{product.seller.sellerProfile.businessName}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-base font-bold text-theme-green">{formatCurrency(product.price)}</span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="text-xs px-3 py-1.5 rounded-full font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={inCart
              ? { background: 'var(--surface-accent)', color: 'var(--green-bright)', border: '1px solid var(--border-accent)' }
              : { background: 'var(--green-bright)', color: 'var(--green-btn-text)' }
            }
          >
            {inCart ? '✓ In Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
