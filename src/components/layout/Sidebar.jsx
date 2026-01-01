import React from 'react';
import { 
  HomeIcon, 
  ShoppingCartIcon, 
  BarChart3, 
  Users,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  Package,
  History,
  ShoppingBag
} from '../icons/index.jsx';

function Sidebar({ activePage, setActivePage, isAdmin, onLogout }) {
  // Regular items for ALL users
  const userItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <HomeIcon className="h-5 w-5" />
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      icon: <ShoppingBag className="h-5 w-5" />
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: <ShoppingCartIcon className="h-5 w-5" />
    },
    {
      id: 'history',
      label: 'Order History',
      icon: <History className="h-5 w-5" />
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <UserIcon className="h-5 w-5" />
    }
  ];

  // Admin-only items
  const adminOnlyItems = isAdmin ? [
    {
      id: 'analysis',
      label: 'Analysis',
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      id: 'admin-analytics',
      label: 'Sales Analytics',
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      id: 'admin-users',
      label: 'User Management',
      icon: <Users className="h-5 w-5" />
    }
  ] : [];

  // Combine items - show user items first, then admin items if applicable
  const allItems = [...userItems, ...adminOnlyItems];

  return (
    <div className="w-64 bg-secondary border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">SuperShop</h1>
        <p className="text-secondary text-sm mt-1">
          {isAdmin ? 'Admin Panel' : 'User Panel'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {/* User Navigation */}
        {userItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activePage === item.id
                ? 'bg-accent text-white'
                : 'text-primary hover:bg-primary hover:bg-opacity-20'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}

        {/* Admin Section Separator */}
        {isAdmin && adminOnlyItems.length > 0 && (
          <div className="pt-4 mt-4 border-t border-border">
            <p className="text-xs text-secondary uppercase tracking-wider mb-3 px-4">
              Admin Panel
            </p>
            {adminOnlyItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activePage === item.id
                    ? 'bg-purple-600 text-white'
                    : 'text-primary hover:bg-primary hover:bg-opacity-20'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-primary hover:bg-red-900 hover:bg-opacity-20 hover:text-red-400 transition"
        >
          <LogOutIcon className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;