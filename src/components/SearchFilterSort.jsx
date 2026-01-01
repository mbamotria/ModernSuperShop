import React from 'react';
import { Search, Filter, ArrowUpDown, X } from '../components/icons/index.jsx';

export function SearchFilterSort({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  categories,
  placeholder = "Search...",
  showCategoryFilter = true,
  showClearButton = true,
  onClearFilters
}) {
  const handleClearFilters = () => {
    setSearchQuery('');
    if (showCategoryFilter) {
      setSelectedCategory('all');
    }
    setSortBy('name-asc');
    if (onClearFilters) {
      onClearFilters();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X className="h-4 w-4 text-secondary hover:text-primary" />
          </button>
        )}
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Category Filter (if enabled) */}
        {showCategoryFilter && (
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent appearance-none cursor-pointer dropdown-select"
            >
              <option value="all" className="bg-secondary text-primary">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category} className="bg-secondary text-primary">{category}</option>
              ))}
            </select>
          </div>
        )}

        {/* Sort Dropdown */}
        <div className="relative flex-1">
          <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent appearance-none cursor-pointer dropdown-select"
          >
            <option value="name-asc" className="bg-secondary text-primary">Name (A-Z)</option>
            <option value="name-desc" className="bg-secondary text-primary">Name (Z-A)</option>
            <option value="price-low" className="bg-secondary text-primary">Price (Low to High)</option>
            <option value="price-high" className="bg-secondary text-primary">Price (High to Low)</option>
            <option value="stock-low" className="bg-secondary text-primary">Stock (Low to High)</option>
            <option value="stock-high" className="bg-secondary text-primary">Stock (High to Low)</option>
            <option value="date-new" className="bg-secondary text-primary">Date (Newest)</option>
            <option value="date-old" className="bg-secondary text-primary">Date (Oldest)</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {showClearButton && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-secondary border border-border rounded-lg text-primary hover:bg-primary hover:bg-opacity-10 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}

// Helper hook for filtering and sorting
export function useFilteredSortedData(data, searchQuery, selectedCategory, sortBy, searchFields = ['name', 'description']) {
  return React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    let filtered = [...data];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        searchFields.some(field => 
          item[field]?.toLowerCase().includes(query)
        )
      );
    }

    // Apply category filter
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(item => 
        item.category === selectedCategory
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
        filtered.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
        break;
      case 'stock-low':
        filtered.sort((a, b) => (a.stock || 0) - (b.stock || 0));
        break;
      case 'stock-high':
        filtered.sort((a, b) => (b.stock || 0) - (a.stock || 0));
        break;
      case 'date-new':
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
      case 'date-old':
        filtered.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
        break;
      default:
        // Default sort by name
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [data, searchQuery, selectedCategory, sortBy, searchFields]);
}