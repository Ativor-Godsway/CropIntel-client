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
  const [confirming, setConfirming] = useState(null); // productId being deleted
  const toast = useToast();

  const fetchProducts = () => {
    setLoading(true);
    getSellerProducts()
      .then(({ data }) => setProducts(data.products))
      .catch(() => toast.error('Failed to load listings'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchProducts, []);

  const handleToggle = async (id) => {
    try {
      const { data } = await toggleProduct(id);
      setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, isActive: data.isActive } : p)));
      toast.success(data.isActive ? 'Listing activated' : 'Listing deactivated');
    } catch {
      toast.error('Failed to toggle listing');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setConfirming(null);
    }
  };

  if (loading) return <PageSpinner />;

  if (products.length === 0) {
    return (
      <EmptyState
        icon="📦"
        title="No listings yet"
        description="Start selling by listing your first product."
        action={<Link to="/seller/list" className="btn-primary">List a Product</Link>}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{products.length} product{products.length !== 1 ? 's' : ''}</p>
        <Link to="/seller/list" className="btn-primary text-xs">+ List New Product</Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Category</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Price</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Stock</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {p.images?.[0]
                          ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-lg">🌿</div>
                        }
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.sales} sold</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs capitalize text-gray-600">{p.category}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-primary-600">
                    {formatCurrency(p.price)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-medium ${p.stock <= 5 ? 'text-red-600' : 'text-gray-700'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggle(p._id)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors
                        ${p.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                      {p.isActive ? '● Active' : '○ Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/seller/edit/${p._id}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                      {confirming === p._id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="text-xs text-red-600 font-semibold hover:underline"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirming(null)}
                            className="text-xs text-gray-400 hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirming(p._id)}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          Delete
                        </button>
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
