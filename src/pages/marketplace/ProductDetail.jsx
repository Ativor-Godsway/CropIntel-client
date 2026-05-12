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
    getProduct(id)
      .then(({ data }) => setProduct(data.product))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageSpinner />;
  if (!product) return (
    <div className="text-center py-16 text-gray-500">
      Product not found. <Link to="/marketplace" className="text-primary-600 hover:underline">Back to marketplace</Link>
    </div>
  );

  const inCart = items.some((i) => i.product._id === product._id);

  const handleAddToCart = () => {
    addItem(product, qty);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1">
        <Link to="/marketplace" className="hover:text-gray-600">Marketplace</Link>
        <span>/</span>
        <span className="text-gray-600 capitalize">{product.category}</span>
        <span>/</span>
        <span className="text-gray-800 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-3">
          <div className="card overflow-hidden bg-gray-50 h-72 sm:h-96">
            {product.images?.length > 0 ? (
              <img
                src={product.images[selectedImg]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                {CATEGORY_ICONS[product.category]}
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImg === i ? 'border-primary-500' : 'border-gray-200'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <span className="text-xs font-medium uppercase text-gray-400 tracking-wide">
              {CATEGORY_ICONS[product.category]} {product.category}
            </span>
            <h1 className="text-xl font-bold text-gray-900 mt-1">{product.name}</h1>
            {product.seller && (
              <p className="text-sm text-gray-500 mt-1">
                by {product.seller.sellerProfile?.businessName || product.seller.name}
                {product.seller.sellerProfile?.location && ` · ${product.seller.sellerProfile.location}`}
              </p>
            )}
          </div>

          <p className="text-2xl font-bold text-primary-600">{formatCurrency(product.price)}</p>

          <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

          {/* Target diseases */}
          {product.targetDiseases?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Treats diseases</p>
              <div className="flex flex-wrap gap-1.5">
                {product.targetDiseases.map((d) => (
                  <span key={d} className="px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full border border-red-100">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-400'}`} />
            <span className="text-sm text-gray-600">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Quantity + cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors text-lg"
                >−</button>
                <span className="px-4 py-2 text-sm font-semibold text-gray-800">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors text-lg"
                >+</button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${inCart ? 'btn-secondary' : 'btn-primary'}`}
              >
                {inCart ? '✓ In Cart — Add More' : '🛒 Add to Cart'}
              </button>
            </div>
          )}

          <Link to="/cart" className="inline-flex items-center text-sm text-primary-600 hover:underline gap-1">
            View Cart →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
