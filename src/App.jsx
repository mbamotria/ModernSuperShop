import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './pages/DashboardPage';
import MarketplacePage from './pages/MarketplacePage';
import AnalysisPage from './pages/AnalysisPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import UserManagementPage from './pages/UserManagementPage';
import './App.css';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartItemsMap, setCartItemsMap] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [authPage, setAuthPage] = useState('login');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load products
  useEffect(() => {
    fetchProducts();
  }, []);

  // Load cart when user logs in
  useEffect(() => {
    if (user && user.user_id) {
      loadCart(user.user_id);
    } else {
      setCart([]);
      setCartItemsMap({});
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/products");
      const data = await response.json();
      
      if (data.success) {
        const formattedProducts = data.products.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          stock: product.stock,
          barcode: product.barcode
        }));
        setProducts(formattedProducts);
      }
    } catch (err) {
      console.error("Product fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async (userId) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/cart/${userId}`);
      const data = await response.json();
      
      if (data.success && data.items) {
        const cartItems = data.items.map(item => ({
          id: item.id,
          cart_item_id: item.cart_item_id,
          name: item.name,
          description: item.description,
          price: parseFloat(item.price),
          quantity: item.quantity,
          stock: item.stock
        }));
        
        setCart(cartItems);
        
        const mapping = {};
        cartItems.forEach(item => {
          mapping[item.id] = item.cart_item_id;
        });
        setCartItemsMap(mapping);
      } else {
        setCart([]);
        setCartItemsMap({});
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      setCart([]);
      setCartItemsMap({});
    }
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAdmin(parsedUser.role === 'admin' || parsedUser.role === 'superadmin');
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  const handleLogin = (userData) => {
    console.log("Login successful for:", userData.email, "Role:", userData.role);
    setUser(userData);
    setIsAdmin(userData.role === 'admin' || userData.role === 'superadmin');
    setActivePage('dashboard');
  };

  const handleRegister = (userData) => {
    console.log("Registration successful for:", userData.email);
    setUser(userData);
    setIsAdmin(userData.role === 'admin' || userData.role === 'superadmin');
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAdmin(false);
    setCart([]);
    setCartItemsMap({});
    setActivePage('dashboard');
  };

  const handleUpdateProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      alert("Please login to add items to cart");
      return;
    }
    
    try {
      const response = await fetch("http://127.0.0.1:5000/cart/add", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.user_id,
          product_id: product.id,
          quantity: 1
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadCart(user.user_id);
      } else {
        alert(data.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleUpdateCartQuantity = async (productId, quantity) => {
    if (!user) return;
    
    const cartItemId = cartItemsMap[productId];
    if (!cartItemId) return;
    
    if (quantity <= 0) {
      await handleRemoveFromCart(productId);
      return;
    }
    
    try {
      const response = await fetch("http://127.0.0.1:5000/cart/update", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_item_id: cartItemId,
          quantity: quantity
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadCart(user.user_id);
      } else {
        alert(data.message || "Failed to update cart");
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleRemoveFromCart = async (productId) => {
    if (!user) return;
    
    const cartItemId = cartItemsMap[productId];
    if (!cartItemId) return;
    
    try {
      const response = await fetch("http://127.0.0.1:5000/cart/remove", {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_item_id: cartItemId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadCart(user.user_id);
      } else {
        alert(data.message || "Failed to remove from cart");
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleCheckout = () => {
    if (!user) {
      alert("Please login to checkout");
      return;
    }
    
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }
    
    setActivePage('checkout');
  };

  const handlePlaceOrder = async (orderData) => {
    if (!user) return;
    
    try {
      // Clear the cart after successful order
      const response = await fetch(`http://127.0.0.1:5000/cart/clear/${user.user_id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Clear local cart state
        setCart([]);
        setCartItemsMap({});
        
        // Navigate to order history
        setActivePage('history');
      } else {
        alert(data.message || "Failed to clear cart after order");
      }
    } catch (error) {
      console.error("Error clearing cart after checkout:", error);
      alert("Order placed but cart clearing failed. Please try again.");
    }
  };
  
  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return products.find(p => p.id === selectedProductId) || null;
  }, [selectedProductId, products]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const renderPage = () => {
    if (!user) {
        if (authPage === 'login') {
            return <LoginPage onLogin={handleLogin} onNavigate={setAuthPage} />;
        } else {
            return <RegisterPage onNavigate={setAuthPage} onRegister={handleRegister} />;
        }
    }

    // Check if user is trying to access admin-only pages
    if (activePage === 'analysis' && !isAdmin) {
        return <DashboardPage setActivePage={setActivePage} onAddToCart={handleAddToCart} />; // Redirect non-admins to dashboard
    }

    switch (activePage) {
        case 'dashboard': 
            return <DashboardPage setActivePage={setActivePage} onAddToCart={handleAddToCart} />; // Added setActivePage prop
        case 'marketplace':
            return (
                <MarketplacePage
                    products={products}
                    cart={cart}
                    onAddToCart={handleAddToCart}
                    onUpdateQuantity={handleUpdateCartQuantity}
                    isAdmin={isAdmin}
                    setActivePage={setActivePage} // Added for consistency
                />
            );
        case 'analysis': 
            return isAdmin ? <AnalysisPage selectedProduct={selectedProduct} onSelectItem={setSelectedProductId} /> : <DashboardPage setActivePage={setActivePage} onAddToCart={handleAddToCart} />;
      case 'cart':
        return (
          <CartPage 
            cart={cart} 
            onUpdateQuantity={handleUpdateCartQuantity} 
            onRemoveItem={handleRemoveFromCart} 
            onCheckout={handleCheckout} 
            onContinueShopping={() => setActivePage('marketplace')} 
            setActivePage={setActivePage} // Added for navigation
          />
        );
      case 'checkout':
        return <CheckoutPage cart={cart} user={user} onPlaceOrder={handlePlaceOrder} total={cartTotal} setActivePage={setActivePage} />;
      case 'profile':
        return <ProfilePage user={user} onUpdateProfile={handleUpdateProfile} onLogout={handleLogout} setActivePage={setActivePage} />;
      case 'history':
        return <OrderHistoryPage setActivePage={setActivePage} />;
      case 'admin-analytics':
        return isAdmin ? <AdminAnalyticsPage /> : <DashboardPage setActivePage={setActivePage} onAddToCart={handleAddToCart} />;
      case 'admin-users':
        return isAdmin ? <UserManagementPage /> : <DashboardPage setActivePage={setActivePage} onAddToCart={handleAddToCart} />;
      default: 
        return <DashboardPage setActivePage={setActivePage} onAddToCart={handleAddToCart} />;
    }
  };

  if (!user) {
    return renderPage();
  }

  return (
    <div className="h-screen bg-primary font-sans flex overflow-hidden">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isAdmin={isAdmin} 
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col">
        <Header 
          currentPage={activePage} 
          cartCount={cart.reduce((total, item) => total + item.quantity, 0)}
          onCartClick={() => setActivePage('cart')}
          user={user}
          onProfileClick={() => setActivePage('profile')}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          {loading && activePage === 'marketplace' ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
                <p className="text-primary text-lg font-semibold">Loading products...</p>
              </div>
            </div>
          ) : (
            renderPage()
          )}
        </main>
      </div>
    </div>
  );
}