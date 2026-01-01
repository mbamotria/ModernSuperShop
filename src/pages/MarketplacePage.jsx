import React, { useState, useEffect, useMemo } from "react";
import ProductCard from "./ProductCard";
import AddProductModal from "../components/AddProductModal";
import UpdateStockModal from "../components/UpdateStockModal";
import { SearchFilterSort, useFilteredSortedData } from "../components/SearchFilterSort";
import { Search, Filter, ArrowUpDown, Plus } from "../components/icons";

const MarketplacePage = ({ products, cart, onAddToCart, onUpdateQuantity, isAdmin }) => {
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [localProducts, setLocalProducts] = useState(products || []);
  
  // Search, filter, and sort state - FIXED: Removed duplicate declaration
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [categories, setCategories] = useState([]); // Only one declaration

  // Update local products when props change
  useEffect(() => {
    setLocalProducts(products || []);
  }, [products]);

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
  const fetchProducts = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/products");
      const data = await res.json();

      if (data.success) {
        setLocalProducts(data.products);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  fetchProducts();
}, []);


  const fetchCategories = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/categories');
      const data = await response.json();
      
      if (data.success) {
        const categoryNames = data.categories.map(cat => cat.name);
        setCategories(categoryNames);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Extract unique categories from products as fallback
  useEffect(() => {
    if (localProducts.length > 0 && categories.length === 0) {
      const uniqueCategories = [...new Set(localProducts
        .map(p => p.category)
        .filter(category => category && category.trim() !== '')
      )];
      setCategories(uniqueCategories);
    }
  }, [localProducts, categories.length]);

  // Use the reusable hook for filtering and sorting
  const filteredProducts = useFilteredSortedData(
    localProducts, 
    searchQuery, 
    selectedCategory, 
    sortBy,
    ['name', 'description', 'category']
  );

  const getCartQuantity = (productId) => {
    const cartItem = cart.find(item => item.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleIncreaseQuantity = (product) => {
    const currentQuantity = getCartQuantity(product.id);
    if (onUpdateQuantity) {
      onUpdateQuantity(product.id, currentQuantity + 1);
    }
  };

  const handleDecreaseQuantity = (product) => {
    const currentQuantity = getCartQuantity(product.id);
    if (onUpdateQuantity && currentQuantity > 0) {
      onUpdateQuantity(product.id, currentQuantity - 1);
    }
  };

  const handleStockUpdated = (productId, newStock) => {
    // Update the product stock in local state
    setLocalProducts(prev => 
      prev.map(p => 
        p.id === productId 
          ? { ...p, stock: newStock }
          : p
      )
    );
  };

  const handleProductAdded = () => {
    // Refresh products list
    if (window.location.reload) {
      window.location.reload();
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("name-asc");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-primary text-lg font-semibold">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 p-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 animate-slide-in-down">          
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition transform hover:scale-105 animate-fade-in"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          )}
        </div>

        {/* Search, Filter, Sort Controls */}
        <div className="bg-secondary p-4 rounded-lg border border-border animate-slide-in-up">
          <div className="mb-2">
            <SearchFilterSort
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
              categories={categories}
              placeholder="Search products by name, description, or category..."
              showClearButton={true}
              onClearFilters={clearAllFilters}
            />
          </div>

          {/* Results Info */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
            <div className="text-sm text-secondary">
              Showing {filteredProducts.length} of {localProducts.length} products
              {(searchQuery || selectedCategory !== "all") && (
                <span className="ml-2">
                  •{" "}
                  <button
                    onClick={clearAllFilters}
                    className="text-accent hover:underline"
                  >
                    Clear filters
                  </button>
                </span>
              )}
            </div>
            
            {/* Active Filters Badges */}
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <span className="px-3 py-1 bg-primary bg-opacity-20 text-primary text-xs rounded-full flex items-center gap-1">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 text-secondary hover:text-primary"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {selectedCategory !== "all" && (
                <span className="px-3 py-1 bg-blue-900 bg-opacity-20 text-blue-300 text-xs rounded-full flex items-center gap-1">
                  Category: {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="ml-1 text-secondary hover:text-primary"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {sortBy !== "name-asc" && (
                <span className="px-3 py-1 bg-purple-900 bg-opacity-20 text-purple-300 text-xs rounded-full">
                  Sorted: {
                    sortBy === "name-desc" ? "Name (Z-A)" :
                    sortBy === "price-low" ? "Price (Low to High)" :
                    sortBy === "price-high" ? "Price (High to Low)" :
                    sortBy === "stock-low" ? "Stock (Low to High)" :
                    sortBy === "stock-high" ? "Stock (High to Low)" :
                    sortBy === "date-new" ? "Date (Newest)" :
                    sortBy === "date-old" ? "Date (Oldest)" :
                    "Custom Sort"
                  }
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-secondary p-12 rounded-lg border border-border text-center animate-fade-in">
            <div className="mb-4">
              <Search className="h-16 w-16 text-secondary mx-auto mb-4 opacity-50" />
              <p className="text-primary text-lg font-semibold mb-2">No products found</p>
              <p className="text-secondary">
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No products available in the marketplace"}
              </p>
            </div>
            
            {(searchQuery || selectedCategory !== "all") && (
              <button
                onClick={clearAllFilters}
                className="mt-4 bg-accent text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-white hover:text-black transition transform hover:scale-105"
              >
                Clear All Filters
              </button>
            )}
            
            {isAdmin && localProducts.length === 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition transform hover:scale-105"
              >
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-stagger">
            {filteredProducts.map((product) => (
              <div key={product.id} className="relative group animate-fade-in transform hover:scale-105 transition">
                <ProductCard
                  product={product}
                  cartQuantity={getCartQuantity(product.id)}
                  stock={product.stock}
                  onAddToCart={() => handleAddToCart(product)}
                  onIncreaseQuantity={() => handleIncreaseQuantity(product)}
                  onDecreaseQuantity={() => handleDecreaseQuantity(product)}
                />
                
                {/* Admin stock button */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowStockModal(true);
                    }}
                    className="absolute top-2 right-2 px-3 py-1.5 bg-yellow-600 text-white text-xs font-semibold rounded-lg hover:bg-yellow-700 transition z-[40] shadow-lg group-hover:scale-110 transform"
                  >
                    Stock: {product.stock}
                  </button>
                )}
                

              </div>
            ))}
          </div>
        )}

        {/* Products Summary */}
        {filteredProducts.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-secondary p-4 rounded-lg border border-border">
                <h3 className="text-sm font-medium text-secondary mb-2">Price Range</h3>
                <p className="text-lg font-semibold text-primary">
                  ${filteredProducts.length > 0 
                    ? Math.min(...filteredProducts.map(p => parseFloat(p.price))).toFixed(2)
                    : "0.00"
                  } - $
                  {filteredProducts.length > 0 
                    ? Math.max(...filteredProducts.map(p => parseFloat(p.price))).toFixed(2)
                    : "0.00"
                  }
                </p>
              </div>
              
              <div className="bg-secondary p-4 rounded-lg border border-border">
                <h3 className="text-sm font-medium text-secondary mb-2">Total Stock</h3>
                <p className="text-lg font-semibold text-primary">
                  {filteredProducts.reduce((sum, product) => sum + (product.stock || 0), 0)} items
                </p>
              </div>
              
              <div className="bg-secondary p-4 rounded-lg border border-border">
                <h3 className="text-sm font-medium text-secondary mb-2">Categories</h3>
                <p className="text-lg font-semibold text-primary">
                  {[...new Set(filteredProducts.map(p => p.category).filter(Boolean))].length} unique
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onProductAdded={handleProductAdded}
      />

      <UpdateStockModal
        isOpen={showStockModal}
        onClose={() => {
          setShowStockModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onStockUpdated={(newStock) => {
          if (selectedProduct) {
            handleStockUpdated(selectedProduct.id, newStock);
          }
        }}
      />
    </>
  );
};

export default MarketplacePage;