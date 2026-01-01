import React, { useState } from 'react';

function UpdateStockModal({ isOpen, onClose, product, onStockUpdated }) {
  const [stockChange, setStockChange] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const change = parseInt(stockChange);
    if (isNaN(change) || change === 0) {
      setError('Please enter a valid number');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://127.0.0.1:5000/admin/products/${product.id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stock_change: change
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Stock updated successfully! New stock: ${data.new_stock}`);
        onStockUpdated(data.new_stock);
        onClose();
        setStockChange('');
      } else {
        setError(data.message || 'Failed to update stock');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] p-4 animate-fade-in">
      <div className="bg-secondary rounded-lg w-full max-w-sm animate-scale-in">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-primary">Update Stock</h2>
            <button
              onClick={onClose}
              className="text-secondary hover:text-primary"
            >
              ✕
            </button>
          </div>

          <div className="mb-6">
            <p className="text-primary font-semibold">{product.name}</p>
            <p className="text-secondary text-sm mt-1">Current Stock: {product.stock}</p>
            <p className="text-secondary text-sm">Price: ${parseFloat(product.price).toFixed(2)}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-primary text-sm font-medium mb-2">
                Stock Change (Positive to add, Negative to remove)
              </label>
              <input
                type="number"
                value={stockChange}
                onChange={(e) => setStockChange(e.target.value)}
                required
                className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="e.g., 10 or -5"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-accent text-white py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Stock'}
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

export default UpdateStockModal;