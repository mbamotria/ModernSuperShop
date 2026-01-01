import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  ShoppingCartIcon, 
  Users, 
  DollarSign,
  Calendar,
  PieChart
} from '../components/icons/index.jsx';

function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/admin/sales-analytics');
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-primary">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Sales Analytics Dashboard</h1>
        <div className="flex gap-2">
          <button 
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-white hover:text-black transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-secondary p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-primary">
                ${analytics.stats.total_revenue.toFixed(2)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-secondary p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-primary">{analytics.stats.total_orders}</p>
            </div>
            <ShoppingCartIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-secondary p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Total Products</p>
              <p className="text-2xl font-bold text-primary">{analytics.stats.total_products}</p>
            </div>
            <Package className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-secondary p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Total Users</p>
              <p className="text-2xl font-bold text-primary">{analytics.stats.total_users}</p>
            </div>
            <Users className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-secondary rounded-lg border border-border p-6">
        <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Selling Products
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 text-primary font-medium">Product</th>
                <th className="text-left py-3 text-primary font-medium">Price</th>
                <th className="text-left py-3 text-primary font-medium">Sold</th>
                <th className="text-left py-3 text-primary font-medium">Revenue</th>
                <th className="text-left py-3 text-primary font-medium">Stock</th>
              </tr>
            </thead>
            <tbody>
              {analytics.top_products.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-primary/5">
                  <td className="py-3 text-primary">{product.name}</td>
                  <td className="py-3 text-secondary">${parseFloat(product.price).toFixed(2)}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-blue-900/20 text-blue-400 rounded text-sm">
                      {product.total_sold}
                    </span>
                  </td>
                  <td className="py-3 text-green-400 font-semibold">
                    ${parseFloat(product.revenue).toFixed(2)}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      product.stock > 20 
                        ? 'bg-green-900/20 text-green-400' 
                        : product.stock > 0 
                          ? 'bg-yellow-900/20 text-yellow-400'
                          : 'bg-red-900/20 text-red-400'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Layout for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Sales */}
        <div className="bg-secondary rounded-lg border border-border p-6">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Sales by Category
          </h2>
          <div className="space-y-4">
            {analytics.category_sales.map((category) => (
              <div key={category.category_name} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-primary">{category.category_name}</span>
                  <span className="text-accent font-semibold">
                    ${parseFloat(category.revenue).toFixed(2)}
                  </span>
                </div>
                <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent rounded-full"
                    style={{ 
                      width: `${Math.min(100, (category.revenue / (analytics.stats.total_revenue || 1)) * 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-secondary">
                  <span>{category.total_sold} items sold</span>
                  <span>{((category.revenue / (analytics.stats.total_revenue || 1)) * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Sales Chart */}
        <div className="bg-secondary rounded-lg border border-border p-6">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Sales (Last 7 Days)
          </h2>
          <div className="space-y-4">
            {analytics.daily_sales.map((day) => (
              <div key={day.sale_date} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-primary">
                    {new Date(day.sale_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-accent font-semibold">
                    ${parseFloat(day.daily_revenue).toFixed(2)}
                  </span>
                </div>
                <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ 
                      width: `${Math.min(100, (day.daily_revenue / Math.max(...analytics.daily_sales.map(d => d.daily_revenue || 1))) * 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-secondary">
                  <span>{day.orders_count} orders</span>
                  <span>{day.items_sold} items</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalyticsPage;