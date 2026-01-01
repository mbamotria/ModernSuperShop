import React from 'react';
import { ShoppingCartIcon } from '../icons/index.jsx';

function Header({ currentPage, cartCount, onCartClick, user, onProfileClick }) {
    const getTitle = () => {
        switch (currentPage) {
            case 'inventory':
                return 'My Shop';
            case 'cart':
                return 'Shopping Cart';
            case 'checkout':
                return 'Checkout';
            case 'profile':
                return 'My Profile';
            case 'history':
                return 'Order History';
            default:
                return currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
        }
    };

    return (
        <header className="flex-shrink-0 bg-secondary h-16 flex items-center justify-between px-6 border-b border-border">
            <h1 className="text-2xl font-semibold text-primary">{getTitle()}</h1>
            
            <div className="flex items-center gap-4">
                {user && (
                    <>
                        <button
                            onClick={onProfileClick}
                            className="text-primary hover:text-white transition px-3 py-2 rounded-lg hover:bg-primary hover:bg-opacity-20"
                        >
                            <span className="text-sm font-medium">{user.name}</span>
                        </button>
                    </>
                )}
                
                <button
                    onClick={onCartClick}
                    className="relative text-primary hover:text-white transition p-2 rounded-lg hover:bg-primary hover:bg-opacity-20"
                >
                    <ShoppingCartIcon className="h-6 w-6" />
                    {cartCount > 0 && (
                        <span className="absolute top-0 right-0 bg-accent text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
}

export default Header;