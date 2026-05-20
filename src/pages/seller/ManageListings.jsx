import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSellerProducts, deleteProduct, toggleProduct } from '../../api/products';
import { useToast } from '../../context/ToastContext';
import { PageSpinner } from '../../components/shared/Spinner';
import { formatCurrency } from '../../utils/formatCurrency';
import EmptyState from '../../components/shared/EmptyState';

const ManageListings = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);
  const toast = useToast();

  const fetchProducts = () => {
    setLoading(true);
    getSellerProducts().then(({ data }) => setProducts(data.products)).catch(() => toast.error('Failed to load listings')).finally(() => setLoading(false));
  };
  useEffect(fetchProducts, []);

  const handleToggle = async (id) => {
    try {
      const { data } = await toggleProduct(id);
      setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, isActive: data.isActive } : p)));
      toast.success(data.isActive ? 'Listing activated' : 'Listing deactivated');
    } catch { toast.error('Failed to toggle listing'); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Failed to delete product'); } finally { setConfirming(null); }
  };

  if (loading) return <PageSpinner />;
  if (products.length === 0) return <EmptyState icon="📦" title="No listings yet" description="Start selling by listing your first product." action={<Link to="/seller/list" className="btn-primary">List a Product</Link>} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-theme-dim">{products.length} product{products.length !== 1 ? 's' : ''}</p>
        <Link to="/seller/list" className="btn-primary text-xs">+ List New Product</Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-subtle)' }}>
              <tr>
                {['Product','Category','Price','Stock','Status','Actions'].map((h, i) => (
                  <th key={h} className={`px-4 py-3 font-medium text-xs text-theme-hint ${i < 2 ? 'text-left' : i < 4 ? 'text-right' : 'text-center'} ${i === 1 ? 'hidden sm:table-cell' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={p._id} className="transition-colors hover:bg-theme-surface-2" style={idx > 0 ? { borderTop: '1px solid var(--border-subtle)' } : {}}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'var(--bg-surface)' }}>
                        {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">🌿</div>}
                      </div>
                      <div>
                        <p className="font-medium text-theme-text line-clamp-1">{p.name}</p>
                        <p className="text-xs text-theme-hint">{p.sales} sold</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell"><span className="text-xs capitalize text-theme-dim">{p.category}</span></td>
                  <td className="px-4 py-3 text-right font-semibold text-theme-green">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3 text-right"><span className="text-sm font-medium" style={{ color: p.stock <= 5 ? 'var(--red-text)' : 'var(--text-label)' }}>{p.stock}</span></td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleToggle(p._id)} className="px-2 py-0.5 rounded-full text-xs font-medium transition-colors"
                      style={p.isActive
                        ? { background: 'var(--surface-accent)', color: 'var(--green-bright)' }
                        : { background: 'var(--bg-surface)', color: 'var(--text-dim)' }
                      }>
                      {p.isActive ? '● Active' : '○ Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link to={`/seller/edit/${p._id}`} className="text-xs text-theme-green hover:underline">Edit</Link>
                      {confirming === p._id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(p._id)} className="text-xs text-theme-red font-semibold hover:underline">Confirm</button>
                          <button onClick={() => setConfirming(null)} className="text-xs text-theme-hint hover:underline">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirming(p._id)} className="text-xs text-theme-red opacity-60 hover:opacity-100">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageListings;
