import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct } from '../../api/products';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { PageSpinner } from '../../components/shared/Spinner';
import { formatCurrency } from '../../utils/formatCurrency';

const CATEGORY_ICONS = { fertilizer: '🌱', pesticide: '🧪', seed: '🌾', tool: '🔧', other: '📦' };

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const { addItem, items } = useCart();
  const toast = useToast();

  useEffect(() => {
    getProduct(id).then(({ data }) => setProduct(data.product)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageSpinner />;
  if (!product) return (
    <div className="text-center py-16 text-theme-muted">
      Product not found. <Link to="/marketplace" className="text-theme-green hover:underline">Back to marketplace</Link>
    </div>
  );

  const inCart = items.some((i) => i.product._id === product._id);
  const handleAddToCart = () => { addItem(product, qty); toast.success(`${product.name} added to cart`); };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <nav className="text-xs text-theme-hint mb-6 flex items-center gap-1">
        <Link to="/marketplace" className="hover:text-theme-muted transition-colors">Marketplace</Link>
        <span>/</span>
        <span className="text-theme-40 capitalize">{product.category}</span>
        <span>/</span>
        <span className="text-theme-label font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="card overflow-hidden h-72 sm:h-96 flex items-center justify-center" style={{ background: 'var(--bg-surface-2)' }}>
            {product.images?.length > 0 ? (
              <img src={product.images[selectedImg]} alt={product.name} className="w-full h-full object-contain" />
            ) : (
              <div className="text-6xl">{CATEGORY_ICONS[product.category]}</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImg(i)} className="w-16 h-16 rounded-xl overflow-hidden transition-all" style={{ border: `2px solid ${selectedImg === i ? 'var(--green-bright)' : 'var(--border-color)'}` }}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <span className="text-xs font-medium uppercase text-theme-hint tracking-wide">{CATEGORY_ICONS[product.category]} {product.category}</span>
            <h1 className="text-xl font-bold text-theme-text mt-1">{product.name}</h1>
            {product.seller && (
              <p className="text-sm text-theme-dim mt-1">
                by {product.seller.sellerProfile?.businessName || product.seller.name}
                {product.seller.sellerProfile?.location && ` · ${product.seller.sellerProfile.location}`}
              </p>
            )}
          </div>

          <p className="text-2xl font-bold text-theme-green">{formatCurrency(product.price)}</p>
          <p className="text-sm text-theme-label leading-relaxed">{product.description}</p>

          {product.targetDiseases?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-theme-hint uppercase tracking-wide mb-2">Treats diseases</p>
              <div className="flex flex-wrap gap-1.5">
                {product.targetDiseases.map((d) => (
                  <span key={d} className="px-2 py-0.5 text-xs rounded-full" style={{ background: 'var(--surface-red)', color: 'var(--red-text)', border: '1px solid var(--border-red)' }}>{d}</span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: product.stock > 0 ? 'var(--green-bright)' : 'var(--red-text)' }} />
            <span className="text-sm text-theme-label">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
          </div>

          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 text-theme-muted hover:bg-theme-surface transition-colors text-lg">−</button>
                <span className="px-4 py-2 text-sm font-semibold text-theme-text">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-3 py-2 text-theme-muted hover:bg-theme-surface transition-colors text-lg">+</button>
              </div>
              <button onClick={handleAddToCart} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${inCart ? 'btn-secondary' : 'btn-primary'}`}>
                {inCart ? '✓ In Cart — Add More' : '🛒 Add to Cart'}
              </button>
            </div>
          )}

          <Link to="/cart" className="inline-flex items-center text-sm text-theme-green hover:underline gap-1">View Cart →</Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
