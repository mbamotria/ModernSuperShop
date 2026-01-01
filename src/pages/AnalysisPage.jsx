import React, { useState, useEffect, useMemo } from 'react';
import { callGeminiAPI } from '../utils/api'; 
import { 
  BoxesIcon, 
  LightbulbIcon, 
  DollarSign, 
  SparklesIcon,
  TrendingUp,
  Package,
  Calendar,
  ShoppingCartIcon,
  Search,
  Filter,
  ArrowUpDown
} from '../components/icons/index.jsx';

function InventorySelector({ 
  products, 
  onSelectProduct, 
  selectedProductId, 
  loading,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  categories
}) {
  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...(products || [])];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category === selectedCategory
      );
    }
    
    // Apply sorting
    switch(sortBy) {
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'stock-low':
        filtered.sort((a, b) => a.stock - b.stock);
        break;
      case 'stock-high':
        filtered.sort((a, b) => b.stock - a.stock);
        break;
      default:
        // Default sort by name
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy]);

  if (loading) {
    return (
      <div className="minimal-card p-6 h-full flex flex-col">
        <h2 className="text-lg font-semibold text-primary mb-4 pb-3 border-b border-border">Select Product for Analysis</h2>
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-secondary">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="minimal-card p-6 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-primary mb-4 pb-3 border-b border-border">Select Product for Analysis</h2>
      
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      
      {/* Filter and Sort Controls */}
      <div className="flex gap-2 mb-4">
        {/* Category Filter */}
        <div className="relative flex-1">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent appearance-none"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        {/* Sort Dropdown */}
        <div className="relative flex-1">
          <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent appearance-none"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-low">Price (Low to High)</option>
            <option value="price-high">Price (High to Low)</option>
            <option value="stock-low">Stock (Low to High)</option>
            <option value="stock-high">Stock (High to Low)</option>
          </select>
        </div>
      </div>
      
      {/* Results Count */}
      <div className="text-sm text-secondary mb-3">
        Showing {filteredProducts.length} of {products.length} products
      </div>

      <div className="flex-grow overflow-y-auto -mr-2 pr-2">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div 
              key={product.id} 
              onClick={() => onSelectProduct(product)}
              className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedProductId === product.id 
                  ? 'bg-accent text-white' 
                  : 'bg-primary bg-opacity-10 text-primary hover:bg-primary hover:bg-opacity-20'
              }`}
            >
              <div className="w-10 h-10 flex items-center justify-center bg-primary bg-opacity-20 rounded-lg mr-3">
                <Package className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium truncate">{product.name}</p>
                <div className="flex items-center gap-2 text-sm opacity-75">
                  <span>${parseFloat(product.price).toFixed(2)}</span>
                  {product.category && (
                    <>
                      <span className="text-xs">•</span>
                      <span className="px-2 py-0.5 bg-primary bg-opacity-10 rounded text-xs">
                        {product.category}
                      </span>
                    </>
                  )}
                </div>
              </div>
              {product.stock > 0 ? (
                <span className="px-2 py-1 bg-green-900 bg-opacity-20 text-green-400 rounded text-xs">
                  {product.stock} in stock
                </span>
              ) : (
                <span className="px-2 py-1 bg-red-900 bg-opacity-20 text-red-400 rounded text-xs">
                  Out of stock
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-secondary pt-10 h-full flex flex-col items-center justify-center">
            <BoxesIcon className="w-12 w-12 text-secondary mb-4"/>
            <p className="font-medium text-primary">No products found</p>
            <p className="text-sm text-secondary">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try changing your search or filter' 
                : 'Add products to see analysis.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductStats({ product, stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-secondary p-4 rounded-lg border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-secondary text-sm">Total Sold</p>
            <p className="text-2xl font-bold text-primary">
              {stats.total_sold || 0}
            </p>
          </div>
          <ShoppingCartIcon className="h-8 w-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-secondary p-4 rounded-lg border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-secondary text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-primary">
              ${parseFloat(stats.total_revenue || 0).toFixed(2)}
            </p>
          </div>
          <DollarSign className="h-8 w-8 text-green-500" />
        </div>
      </div>

      <div className="bg-secondary p-4 rounded-lg border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-secondary text-sm">Total Orders</p>
            <p className="text-2xl font-bold text-primary">
              {stats.total_orders || 0}
            </p>
          </div>
          <Calendar className="h-8 w-8 text-purple-500" />
        </div>
      </div>

      <div className="bg-secondary p-4 rounded-lg border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-secondary text-sm">Avg per Order</p>
            <p className="text-2xl font-bold text-primary">
              {parseFloat(stats.avg_quantity_per_order || 0).toFixed(1)}
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-yellow-500" />
        </div>
      </div>
    </div>
  );
}

function AIGenerator({ title, buttonText, idea, onGenerate, isGenerating, color, Icon, ideaBg, ideaTextColor }) {
  return (
    <div className="minimal-card p-4">
      <h3 className="text-lg font-semibold text-primary mb-3">{title}</h3>
      <button 
        onClick={onGenerate} 
        disabled={isGenerating}
        className={`w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed ${color}`}
      >
        {isGenerating ? 'Generating...' : <><Icon className="h-4 w-4 mr-2" />{buttonText}</>}
      </button>
      {idea && <div className={`mt-3 p-3 rounded-lg text-sm whitespace-pre-wrap border ${ideaBg} ${ideaTextColor}`}>{idea}</div>}
    </div>
  );
}

function AnalysisPanel({ 
  product, 
  associatedProducts, 
  stats,
  marketingIdeas, 
  weeklyPromotion, 
  pricingStrategy, 
  isGenerating,
  onGenerateSlogans,
  onGeneratePromotion,
  onGeneratePricing
}) {
  if (!product) {
    return (
      <div className="minimal-card h-full flex items-center justify-center">
        <div className="text-center text-secondary">
          <LightbulbIcon className="h-16 w-16 mx-auto mb-4 text-secondary"/>
          <p className="font-medium text-primary">Select a product from the list</p>
          <p className="text-sm text-secondary">to view co-purchase data and generate AI-powered insights.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="minimal-card h-full overflow-y-auto p-6">
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-primary mb-1">
              Analysis for: <span className="text-accent">{product.name}</span>
            </h2>
            <p className="text-secondary">{product.description || 'No description available'}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-accent">${parseFloat(product.price).toFixed(2)}</p>
            <p className="text-sm text-secondary">
              Stock: <span className={product.stock > 0 ? 'text-green-400' : 'text-red-400'}>
                {product.stock}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Product Statistics */}
      <ProductStats product={product} stats={stats} />

      {/* Associated Products */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
          <ShoppingCartIcon className="h-5 w-5" />
          Frequently Bought Together
        </h3>
        {associatedProducts && associatedProducts.length > 0 ? (
          <div className="space-y-3">
            {associatedProducts.map((item) => (
              <div 
                key={item.product_id} 
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-primary hover:bg-opacity-10 transition"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 flex items-center justify-center bg-primary bg-opacity-20 rounded-lg mr-3">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-primary">{item.name}</p>
                    <p className="text-secondary text-sm">${parseFloat(item.price).toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-secondary text-sm">Co-purchased</p>
                      <p className="text-accent font-bold text-lg">{item.percentage}%</p>
                    </div>
                    <div className="w-2 h-10 bg-accent rounded-full" style={{ 
                      width: '4px',
                      height: `${Math.min(100, item.percentage * 2)}px` 
                    }}></div>
                  </div>
                  <p className="text-secondary text-xs mt-1">
                    {item.co_purchase_count} orders
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-primary bg-opacity-5 rounded-lg">
            <ShoppingCartIcon className="h-12 w-12 text-secondary mx-auto mb-3 opacity-50" />
            <p className="text-secondary">No co-purchase data available for this product.</p>
            <p className="text-secondary text-sm">This product hasn't been purchased with other items yet.</p>
          </div>
        )}
      </div>

      {/* AI Generators */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">AI-Powered Insights</h3>
        
        <AIGenerator 
          title="Pricing Strategy" 
          buttonText="Suggest Pricing" 
          idea={pricingStrategy}
          onGenerate={onGeneratePricing} 
          isGenerating={isGenerating.pricing} 
          color="bg-blue-600 text-white hover:bg-blue-700"
          Icon={DollarSign} 
          ideaBg="bg-blue-900 bg-opacity-20" 
          ideaTextColor="text-blue-300" 
        />
        
        <AIGenerator 
          title="Weekly Promotion" 
          buttonText="Create Promotion" 
          idea={weeklyPromotion}
          onGenerate={onGeneratePromotion} 
          isGenerating={isGenerating.promotion} 
          color="bg-green-600 text-white hover:bg-green-700"
          Icon={SparklesIcon} 
          ideaBg="bg-green-900 bg-opacity-20" 
          ideaTextColor="text-green-300" 
        />
        
        <AIGenerator 
          title="Marketing Slogans" 
          buttonText="Generate Slogans" 
          idea={marketingIdeas}
          onGenerate={onGenerateSlogans} 
          isGenerating={isGenerating.slogans} 
          color="bg-orange-600 text-white hover:bg-orange-700"
          Icon={SparklesIcon} 
          ideaBg="bg-orange-900 bg-opacity-20" 
          ideaTextColor="text-orange-300" 
        />
      </div>
    </div>
  );
}

function AnalysisPage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [associatedProducts, setAssociatedProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [marketingIdeas, setMarketingIdeas] = useState('');
  const [weeklyPromotion, setWeeklyPromotion] = useState('');
  const [pricingStrategy, setPricingStrategy] = useState('');
  const [isGenerating, setIsGenerating] = useState({
    slogans: false, 
    promotion: false, 
    pricing: false 
  });
  
  // New state for search, filter, and sort
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [categories, setCategories] = useState([]);

  // Load all products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);
  

  // Extract categories from products
  useEffect(() => {
    if (products.length > 0) {
      const uniqueCategories = [...new Set(products
        .map(p => p.category)
        .filter(category => category && category.trim() !== '')
      )];
      setCategories(uniqueCategories);
    }
  }, [products]);

  // Load analysis when product is selected
  useEffect(() => {
    if (selectedProduct) {
      fetchProductAnalysis(selectedProduct.id);
    } else {
      setAssociatedProducts([]);
      setStats(null);
    }
  }, [selectedProduct]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/products');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/categories');
            const data = await response.json();
            
            if (data.success) {
                // Extract just the category names
                const categoryNames = data.categories.map(cat => cat.name);
                setCategories(categoryNames);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

  const fetchProductAnalysis = async (productId) => {
    setAnalysisLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/analysis/product/${productId}`);
      const data = await response.json();
      
      if (data.success) {
        setAssociatedProducts(data.associated_products || []);
        setStats(data.stats || {});
        
        // Clear previous AI insights
        setMarketingIdeas('');
        setWeeklyPromotion('');
        setPricingStrategy('');
      }
    } catch (error) {
      console.error('Error fetching product analysis:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const generateWithAI = async (type, product, associatedProducts, stats) => {
    let systemPrompt = '';
    let userQuery = '';

    switch(type) {
      case 'pricing':
        systemPrompt = `You are a pricing strategy expert for an e-commerce store. 
          Analyze product data and provide specific pricing recommendations.`;
        userQuery = `Product: ${product.name}, Price: $${product.price}, Stock: ${product.stock}.
          Associated products: ${associatedProducts.map(p => `${p.name} ($${p.price})`).join(', ')}.
          Sales stats: Total sold: ${stats?.total_sold || 0}, Revenue: $${stats?.total_revenue || 0}.
          Suggest specific pricing strategies and bundle recommendations.`;
        break;
        
      case 'promotion':
        systemPrompt = `You are a marketing specialist creating weekly promotions for e-commerce products.`;
        userQuery = `Create a weekly promotion for: ${product.name} ($${product.price}).
          Top co-purchased items: ${associatedProducts.slice(0, 3).map(p => p.name).join(', ')}.
          Include limited-time offers, bundle discounts, and compelling marketing copy.`;
        break;
        
      case 'slogans':
        systemPrompt = `You are a creative copywriter generating marketing slogans for e-commerce products.`;
        userQuery = `Generate 3-5 catchy marketing slogans for: ${product.name}.
          This product is often bought with: ${associatedProducts.slice(0, 3).map(p => p.name).join(', ')}.
          Focus on bundle benefits, value propositions, and emotional appeals.`;
        break;
        
      default:
        return "Invalid request type";
    }

    try {
      const response = await callGeminiAPI(systemPrompt, userQuery);
      return response;
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      return `Unable to generate ${type} insights at this time.`;
    }
  };

  const handleGenerateSlogans = async () => {
    if (!selectedProduct || associatedProducts.length === 0) return;
    
    setIsGenerating(prev => ({ ...prev, slogans: true }));
    try {
      const response = await generateWithAI('slogans', selectedProduct, associatedProducts, stats);
      setMarketingIdeas(response);
    } catch (error) {
      console.error('Error generating slogans:', error);
      setMarketingIdeas('Error generating slogans. Please try again.');
    } finally {
      setIsGenerating(prev => ({ ...prev, slogans: false }));
    }
  };

  const handleGeneratePromotion = async () => {
    if (!selectedProduct || associatedProducts.length === 0) return;
    
    setIsGenerating(prev => ({ ...prev, promotion: true }));
    try {
      const response = await generateWithAI('promotion', selectedProduct, associatedProducts, stats);
      setWeeklyPromotion(response);
    } catch (error) {
      console.error('Error generating promotion:', error);
      setWeeklyPromotion('Error generating promotion. Please try again.');
    } finally {
      setIsGenerating(prev => ({ ...prev, promotion: false }));
    }
  };

  const handleGeneratePricing = async () => {
    if (!selectedProduct || associatedProducts.length === 0) return;
    
    setIsGenerating(prev => ({ ...prev, pricing: true }));
    try {
      const response = await generateWithAI('pricing', selectedProduct, associatedProducts, stats);
      setPricingStrategy(response);
    } catch (error) {
      console.error('Error generating pricing strategy:', error);
      setPricingStrategy('Error generating pricing strategy. Please try again.');
    } finally {
      setIsGenerating(prev => ({ ...prev, pricing: false }));
    }
  };

  // Clear filters function
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('name-asc');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-5rem)]">
      {/* Left Sidebar - Product Selector */}
      <div className="lg:col-span-4 h-full">
        <InventorySelector 
          products={products}
          onSelectProduct={setSelectedProduct}
          selectedProductId={selectedProduct?.id}
          loading={loading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categories={categories}
        />
      </div>

      {/* Main Analysis Panel */}
      <div className="lg:col-span-8 h-full">
        {analysisLoading ? (
          <div className="minimal-card h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
              <p className="text-primary">Analyzing purchase patterns...</p>
            </div>
          </div>
        ) : (
          <AnalysisPanel 
            product={selectedProduct}
            associatedProducts={associatedProducts}
            stats={stats}
            marketingIdeas={marketingIdeas}
            weeklyPromotion={weeklyPromotion}
            pricingStrategy={pricingStrategy}
            isGenerating={isGenerating}
            onGenerateSlogans={handleGenerateSlogans}
            onGeneratePromotion={handleGeneratePromotion}
            onGeneratePricing={handleGeneratePricing}
          />
        )}
      </div>
    </div>
  );
}

export default AnalysisPage;