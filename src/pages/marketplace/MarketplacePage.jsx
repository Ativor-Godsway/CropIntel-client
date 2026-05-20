import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getProducts } from '../../api/products';
import ProductCard from '../../components/marketplace/ProductCard';
import SkeletonCard from '../../components/shared/SkeletonCard';
import EmptyState from '../../components/shared/EmptyState';

const CATEGORIES = ['fertilizer', 'pesticide', 'seed', 'tool', 'other'];

const MarketplacePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    disease: searchParams.get('disease') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    page: parseInt(searchParams.get('page')) || 1,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search)   params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.disease)  params.disease = filters.disease;
      if (filters.minPrice) params.minPrice = Math.round(parseFloat(filters.minPrice) * 100);
      if (filters.maxPrice) params.maxPrice = Math.round(parseFloat(filters.maxPrice) * 100);
      params.page = filters.page; params.limit = 12;
      const { data } = await getProducts(params);
      setProducts(data.products); setTotal(data.total); setPages(data.pages);
    } catch { } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    setSearchParams(params, { replace: true });
  }, [filters]);

  const updateFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  const clearFilters = () => setFilters({ search: '', category: '', disease: '', minPrice: '', maxPrice: '', page: 1 });
  const hasFilters = filters.search || filters.category || filters.disease || filters.minPrice || filters.maxPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-theme-text mb-1">Farming Marketplace</h1>
        <p className="text-sm text-theme-muted">Quality seeds, fertilizers, pesticides and tools for Ghanaian farmers</p>
      </div>

      {filters.disease && (
        <div className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between" style={{ background: 'var(--surface-gold)', border: '1px solid var(--border-gold)' }}>
          <p className="text-sm text-theme-gold">Showing products for: <span className="font-semibold">{filters.disease}</span></p>
          <button onClick={() => updateFilter('disease', '')} className="text-sm text-theme-gold hover:underline">Clear</button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-56 flex-shrink-0">
          <div className="card p-4 space-y-4 lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-theme-80">Filters</h3>
              {hasFilters && <button onClick={clearFilters} className="text-xs text-theme-red hover:underline">Clear all</button>}
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-muted mb-1">Search</label>
              <input type="text" className="input text-sm" placeholder="Product name..." value={filters.search} onChange={(e) => updateFilter('search', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-muted mb-1">Category</label>
              <div className="space-y-1">
                {['', ...CATEGORIES].map((cat) => (
                  <button
                    key={cat || 'all'}
                    onClick={() => updateFilter('category', cat)}
                    className="w-full text-left text-xs px-2 py-1.5 rounded-lg transition-colors"
                    style={filters.category === cat
                      ? { background: 'var(--surface-accent)', color: 'var(--green-bright)', fontWeight: 500 }
                      : { color: 'var(--text-muted)' }
                    }
                    onMouseEnter={e => { if (filters.category !== cat) e.currentTarget.style.background = 'var(--bg-surface)'; }}
                    onMouseLeave={e => { if (filters.category !== cat) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'All Categories'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-muted mb-1">Price Range (GHS)</label>
              <div className="flex gap-2">
                <input type="number" className="input text-xs" placeholder="Min" value={filters.minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)} />
                <input type="number" className="input text-xs" placeholder="Max" value={filters.maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)} />
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          {!loading && <p className="text-sm text-theme-dim mb-4">{total} product{total !== 1 ? 's' : ''} found{hasFilters && ' with current filters'}</p>}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button disabled={filters.page <= 1} onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">← Prev</button>
                  <span className="text-sm text-theme-muted">Page {filters.page} of {pages}</span>
                  <button disabled={filters.page >= pages} onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">Next →</button>
                </div>
              )}
            </>
          ) : (
            <EmptyState icon="🌿" title="No products found" description="Try adjusting your filters or search terms." action={<button onClick={clearFilters} className="btn-primary">Clear Filters</button>} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
