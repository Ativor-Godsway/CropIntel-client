import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, updateProduct, getProduct } from '../../api/products';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/shared/Spinner';
import { parseToPesewas, formatCurrency } from '../../utils/formatCurrency';
import { useEffect } from 'react';

const CATEGORIES = ['fertilizer', 'pesticide', 'seed', 'tool', 'other'];

const ListProduct = () => {
  const { id } = useParams(); // edit mode if id present
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef();

  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEdit);
  const [images, setImages] = useState([]); // File objects for new uploads
  const [existingImages, setExistingImages] = useState([]); // URLs already on Cloudinary
  const [previews, setPreviews] = useState([]);

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    targetDiseases: '',
    price: '',
    stock: '',
  });

  // Load existing product data if editing
  useEffect(() => {
    if (!isEdit) return;
    getProduct(id)
      .then(({ data }) => {
        const p = data.product;
        setForm({
          name: p.name,
          description: p.description,
          category: p.category,
          targetDiseases: p.targetDiseases.join(', '),
          price: (p.price / 100).toFixed(2),
          stock: String(p.stock),
        });
        setExistingImages(p.images || []);
        setPreviews(p.images || []);
      })
      .catch(() => toast.error('Failed to load product'))
      .finally(() => setLoadingProduct(false));
  }, [id]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length + images.length + files.length;
    if (totalImages > 4) {
      return toast.error('Maximum 4 images per product');
    }
    const newFiles = files.slice(0, 4 - existingImages.length - images.length);
    setImages((prev) => [...prev, ...newFiles]);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
    setPreviews((prev) => prev.filter((u) => u !== url));
  };

  const removeNewImage = (index) => {
    // Offset by existingImages.length since previews = [...existingImages, ...newPreviews]
    const adjustedIndex = index - existingImages.length;
    setImages((prev) => prev.filter((_, i) => i !== adjustedIndex));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.category || !form.price || !form.stock) {
      return toast.error('Please fill in all required fields');
    }
    if (!isEdit && images.length === 0) {
      return toast.error('Please upload at least one product image');
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('targetDiseases', form.targetDiseases);
      formData.append('price', parseToPesewas(form.price));
      formData.append('stock', form.stock);

      // Append new image files for Cloudinary upload via multer
      images.forEach((file) => formData.append('images', file));

      // Send existing image URLs so the server can keep them
      if (isEdit) {
        existingImages.forEach((url) => formData.append('existingImages', url));
      }

      if (isEdit) {
        await updateProduct(id, formData);
        toast.success('Product updated!');
      } else {
        await createProduct(formData);
        toast.success('Product listed successfully!');
      }
      navigate('/seller/listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) return <Spinner size="lg" className="mx-auto mt-20" />;

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        {isEdit ? 'Edit Product' : 'List a New Product'}
      </h2>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images <span className="text-gray-400 font-normal">(max 4)</span>
          </label>
          <div className="flex flex-wrap gap-3 mb-3">
            {previews.map((src, i) => (
              <div key={i} className="relative w-24 h-24">
                <img src={src} alt="" className="w-full h-full object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => i < existingImages.length ? removeExistingImage(src) : removeNewImage(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
            {previews.length < 4 && (
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
              >
                <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs">Add</span>
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Mancozeb 80% WP Fungicide"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            className="input min-h-[100px] resize-y"
            placeholder="Describe your product, its uses, and key benefits..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="">Select...</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
            <input
              type="number"
              min="0"
              className="input"
              placeholder="100"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (GHS) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₵</span>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input pl-7"
              placeholder="85.00"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Diseases <span className="text-gray-400 font-normal">(comma-separated)</span>
          </label>
          <input
            type="text"
            className="input"
            placeholder="late blight, leaf spot, powdery mildew"
            value={form.targetDiseases}
            onChange={(e) => setForm({ ...form, targetDiseases: e.target.value })}
          />
          <p className="text-xs text-gray-400 mt-1">
            Used by AI to recommend this product after disease diagnosis
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/seller/listings')}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? <Spinner size="sm" /> : isEdit ? 'Update Product' : 'List Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ListProduct;
