import React, { useState, useEffect } from 'react';
import { 
  ShoppingCartIcon, 
  Package, 
  DollarSign, 
  TrendingUp,
  Clock,
  Calendar,
  CheckCircle,
  ArrowRight,
  Activity,
  Users
} from '../components/icons/index.jsx';

function DashboardPage({ setActivePage, products, onAddToCart }) {
  const [user, setUser] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    recentOrders: [],
    cartItems: 0,
    favoriteCategory: '',
    memberSince: ''
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(storedUser);
    fetchDashboardData(storedUser);
  }, []);

  const fetchDashboardData = async (currentUser) => {
    setLoading(true);
    try {
      // Get user orders
      const ordersResponse = await fetch(`http://127.0.0.1:5000/user/${currentUser.user_id}/orders`);
      const ordersData = await ordersResponse.json();
      
      // Get user cart
      const cartResponse = await fetch(`http://127.0.0.1:5000/cart/${currentUser.user_id}`);
      const cartData = await cartResponse.json();
      
      // Calculate stats
      let totalOrders = 0;
      let totalSpent = 0;
      let recentOrders = [];
      let categoryMap = {};
      let memberSinceDate = '';
      
      if (ordersData.success && ordersData.orders) {
        totalOrders = ordersData.orders.length;
        totalSpent = ordersData.orders.reduce((sum, order) => sum + (order.total || 0), 0);
        recentOrders = ordersData.orders.slice(0, 3);
        
        // Count categories for favorite category
        ordersData.orders.forEach(order => {
          order.items?.forEach(item => {
            if (item.category) {
              categoryMap[item.category] = (categoryMap[item.category] || 0) + 1;
            }
          });
        });
      }
      
      let favoriteCategory = '';
      let maxCount = 0;
      Object.entries(categoryMap).forEach(([category, count]) => {
        if (count > maxCount) {
          maxCount = count;
          favoriteCategory = category;
        }
      });
      
      // Get cart item count
      const cartItems = cartData.success ? (cartData.items?.length || 0) : 0;
      
      // Calculate member since date
      // Use today's date as default if created_at is not available, or calculate based on orders
      if (recentOrders.length > 0) {
        const oldestOrder = recentOrders[recentOrders.length - 1];
        if (oldestOrder.created_at) {
          memberSinceDate = new Date(oldestOrder.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      }
      
      // If no orders, use current date
      if (!memberSinceDate) {
        memberSinceDate = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      
      // Generate recent activity
      const activity = [];
      if (recentOrders.length > 0) {
        recentOrders.forEach(order => {
          activity.push({
            id: order.id,
            type: 'order',
            title: `Order #${order.id} placed`,
            description: `$${order.total.toFixed(2)} • ${order.items?.length || 0} items`,
            time: new Date(order.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            icon: <CheckCircle className="h-4 w-4 text-green-400" />
          });
        });
      }
      
      if (cartItems > 0) {
        activity.unshift({
          id: 'cart',
          type: 'cart',
          title: 'Items in cart',
          description: `${cartItems} items ready for checkout`,
          time: 'Just now',
          icon: <ShoppingCartIcon className="h-4 w-4 text-blue-400" />
        });
      }
      
      setDashboardStats({
        totalOrders,
        totalSpent,
        recentOrders,
        cartItems,
        favoriteCategory: favoriteCategory || 'None yet',
        memberSince: memberSinceDate
      });
      
      setRecentActivity(activity);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
    
    // Fetch popular products
    fetchPopularProducts();
  };

  const fetchPopularProducts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/popular-products');
      const data = await response.json();
      
      if (data.success) {
        setPopularProducts(data.products.slice(0, 4));
      }
    } catch (error) {
      console.error('Error fetching popular products:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleNavigation = (page) => {
    if (setActivePage) {
      setActivePage(page);
    } else {
      console.warn('setActivePage function not provided');
    }
  };

  const handleAddToCart = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleCategoryNavigation = () => {
    if (setActivePage) {
      setActivePage('marketplace');
      // You could also pass additional data to filter by category
      // This would require a more sophisticated state management
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-primary">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 animate-slide-in-down">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-secondary">Welcome to your SuperShop dashboard</p>
        </div>
        <div className="flex items-center gap-2 text-secondary text-sm bg-primary bg-opacity-20 px-4 py-2 rounded-lg">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-stagger">
        <div className="bg-secondary p-6 rounded-xl border border-border hover:border-accent/50 transition transform hover:scale-105 hover:shadow-lg animate-slide-in-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm mb-2">Total Orders</p>
              <p className="text-3xl font-bold text-primary">{dashboardStats.totalOrders}</p>
            </div>
            <div className="p-3 bg-blue-900/20 rounded-lg">
              <Package className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-secondary text-sm">All time purchases</p>
          </div>
        </div>

        <div className="bg-secondary p-6 rounded-xl border border-border hover:border-accent/50 transition transform hover:scale-105 hover:shadow-lg animate-slide-in-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm mb-2">Total Spent</p>
              <p className="text-3xl font-bold text-primary">${dashboardStats.totalSpent.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-900/20 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-secondary text-sm">Lifetime value</p>
          </div>
        </div>

        <div className="bg-secondary p-6 rounded-xl border border-border hover:border-accent/50 transition transform hover:scale-105 hover:shadow-lg animate-slide-in-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm mb-2">Cart Items</p>
              <p className="text-3xl font-bold text-primary">{dashboardStats.cartItems}</p>
            </div>
            <div className="p-3 bg-purple-900/20 rounded-lg">
              <ShoppingCartIcon className="h-6 w-6 text-purple-400" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-secondary text-sm">Ready for checkout</p>
          </div>
        </div>

        <div className="bg-secondary p-6 rounded-xl border border-border hover:border-accent/50 transition transform hover:scale-105 hover:shadow-lg animate-slide-in-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm mb-2">Favorite Category</p>
              <p className="text-xl font-bold text-primary truncate">{dashboardStats.favoriteCategory}</p>
            </div>
            <div className="p-3 bg-yellow-900/20 rounded-lg">
              <Activity className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-secondary text-sm">Most purchased</p>
          </div>
        </div>
      </div>

      {/* Three Column Layout - Quick Actions Left, Popular Products Right (2 rows) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-stagger">
        {/* Quick Actions */}
        <div className="bg-secondary rounded-xl border border-border overflow-hidden transform hover:shadow-lg transition animate-slide-in-left">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-primary">Quick Actions</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 animate-stagger">
              <button 
                onClick={() => handleNavigation('marketplace')}
                className="p-4 bg-primary/10 rounded-lg text-center hover:bg-primary/20 transition w-full transform hover:scale-105 animate-fade-in"
              >
                <div className="p-2 bg-accent/20 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <ShoppingCartIcon className="h-6 w-6 text-accent" />
                </div>
                <p className="font-medium text-primary">Shop Now</p>
                <p className="text-secondary text-xs mt-1">Browse products</p>
              </button>
              
              <button 
                onClick={() => handleNavigation('cart')}
                className="p-4 bg-primary/10 rounded-lg text-center hover:bg-primary/20 transition w-full transform hover:scale-105 animate-fade-in"
              >
                <div className="p-2 bg-blue-900/20 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Package className="h-6 w-6 text-blue-400" />
                </div>
                <p className="font-medium text-primary">View Cart</p>
                <p className="text-secondary text-xs mt-1">{dashboardStats.cartItems} items</p>
              </button>
              
              <button 
                onClick={() => handleNavigation('profile')}
                className="p-4 bg-primary/10 rounded-lg text-center hover:bg-primary/20 transition w-full transform hover:scale-105 animate-fade-in"
              >
                <div className="p-2 bg-green-900/20 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <p className="font-medium text-primary">Profile</p>
                <p className="text-secondary text-xs mt-1">Manage account</p>
              </button>
              
              <button 
                onClick={() => handleNavigation('history')}
                className="p-4 bg-primary/10 rounded-lg text-center hover:bg-primary/20 transition w-full transform hover:scale-105 animate-fade-in"
              >
                <div className="p-2 bg-purple-900/20 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                </div>
                <p className="font-medium text-primary">Orders</p>
                <p className="text-secondary text-xs mt-1">{dashboardStats.totalOrders} orders</p>
              </button>
            </div>
          </div>
        </div>

        {/* Most Popular Products - Right side (2 rows) */}
        <div className="lg:col-span-2 animate-slide-in-right">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-yellow-400" />
            Most Popular Right Now
          </h2>
          
          {popularProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 animate-stagger">
              {popularProducts.slice(0, 4).map((product, index) => (
                <div key={product.id} className="p-4 bg-primary/10 rounded-lg border border-border/50 hover:border-accent/50 transition transform hover:scale-105 animate-fade-in">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-primary text-sm line-clamp-2 flex-1">{product.name}</h4>
                    <span className="text-yellow-400 text-xs font-bold ml-2">#{index + 1}</span>
                  </div>
                  <p className="text-secondary text-xs mb-3 line-clamp-2">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-accent font-bold text-lg">${parseFloat(product.price).toFixed(2)}</p>
                    <p className="text-secondary text-xs">{product.sales} sold</p>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full mt-3 bg-accent/20 text-accent text-xs py-2 rounded hover:bg-accent/30 transition"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-secondary mx-auto mb-4 opacity-50" />
              <p className="text-secondary text-sm">Loading popular products...</p>
            </div>
          )}
        </div>
      </div>

      {/* Account Info - Standalone card */}
      <div className="bg-secondary rounded-xl border border-border p-6 animate-slide-in-right transform hover:shadow-lg transition">
        <h2 className="text-xl font-bold text-primary mb-4">Account Overview</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-secondary">Member Since</span>
            <span className="font-medium text-primary">{dashboardStats.memberSince}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary">Account Type</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              user?.role === 'admin' 
                ? 'bg-purple-900/20 text-purple-400' 
                : 'bg-blue-900/20 text-blue-400'
            }`}>
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary">Average Order</span>
            <span className="font-medium text-primary">
              ${dashboardStats.totalOrders > 0 ? (dashboardStats.totalSpent / dashboardStats.totalOrders).toFixed(2) : '0.00'}
            </span>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border">
          <div className="text-sm text-secondary">
            <p className="mb-2">Need help with your account?</p>
            <button className="text-accent hover:text-white transition">Contact Support →</button>
          </div>
        </div>
      </div>

      {/* Recent Activity - At the very bottom */}
      <div className="bg-secondary rounded-xl border border-border overflow-hidden animate-slide-in-up transform hover:shadow-lg transition">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </h2>
        </div>
        
        <div className="p-4">
          {recentActivity.length > 0 ? (
            <div className="space-y-4 animate-stagger">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-primary/10 transition transform hover:translate-x-1 animate-fade-in">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary">{activity.title}</h4>
                    <p className="text-secondary text-sm mt-1">{activity.description}</p>
                    <p className="text-secondary text-xs mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-secondary mx-auto mb-4 opacity-50" />
              <p className="text-primary font-medium">No recent activity</p>
              <p className="text-secondary text-sm mt-1">Start shopping to see your activity here</p>
            </div>
          )}
          
          {dashboardStats.totalOrders > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <button 
                onClick={() => handleNavigation('history')}
                className="w-full flex items-center justify-between text-accent hover:text-white transition"
              >
                <span>View all orders</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
