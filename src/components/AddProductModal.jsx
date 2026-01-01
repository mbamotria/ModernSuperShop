import React, { useState, useEffect } from 'react';

function AddProductModal({ isOpen, onClose, onProductAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '1',
    barcode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);

  // Fetch categories on component mount
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/categories');
      const data = await response.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
        // Set first category as default if available
        if (data.categories.length > 0) {
          setFormData(prev => ({ ...prev, category_id: String(data.categories[0].id) }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock) || 0
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Product added successfully!');
        onProductAdded();
        onClose();
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          category_id: '1',
          barcode: ''
        });
      } else {
        setError(data.message || 'Failed to add product');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary">Add New Product</h2>
            <button
              onClick={onClose}
              className="text-secondary hover:text-primary"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-primary text-sm font-medium mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-primary text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-primary text-sm font-medium mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-primary text-sm font-medium mb-2">
                  Initial Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-primary text-sm font-medium mb-2">
                Category
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent appearance-none cursor-pointer dropdown-select"
              >
                {categories.length > 0 ? (
                  categories.map(cat => (
                    <option key={cat.id} value={String(cat.id)} className="bg-secondary text-primary">
                      {cat.name}
                    </option>
                  ))
                ) : (
                  <option value="1" className="bg-secondary text-primary">Loading categories...</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-primary text-sm font-medium mb-2">
                Barcode (Optional)
              </label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Enter barcode"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-accent text-white py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-primary bg-opacity-20 text-primary py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProductModal;