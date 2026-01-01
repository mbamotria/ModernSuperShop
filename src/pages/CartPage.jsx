import React from 'react';
// Change this import:
import { Trash2Icon, ShoppingCartIcon, PlusIcon, MinusIcon } from '../components/icons/index.jsx';
// This one should work as-is since ShoppingCartIcon is exported correctly

function CartPage({ cart, onUpdateQuantity, onRemoveItem, onCheckout, onContinueShopping }) {
    if (!cart || cart.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center animate-fade-in">
                <ShoppingCartIcon className="h-24 w-24 text-secondary mb-4 opacity-50 animate-pulse" />
                <h2 className="text-2xl font-bold text-primary mb-2">Your Cart is Empty</h2>
                <p className="text-secondary mb-8">Add items to get started shopping</p>
                <button
                    onClick={onContinueShopping}
                    className="bg-accent text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:bg-white hover:text-black transform hover:scale-105"
                >
                    Browse Marketplace
                </button>
            </div>
        );
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between animate-slide-in-down">
                <p className="text-secondary text-lg">
                    {cart.reduce((total, item) => total + item.quantity, 0)} items
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-stagger">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-3">
                    {cart.map((item) => {
                        const remainingStock = item.stock - item.quantity;
                        const isMaxQuantity = item.quantity >= item.stock;
                        
                        return (
                            <div
                                key={item.id}
                                className="bg-secondary p-4 rounded-lg border border-border flex items-center justify-between animate-fade-in transform hover:translate-x-1 transition"
                            >
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-primary">{item.name}</h3>
                                    <p className="text-secondary text-sm mt-1">${item.price.toFixed(2)}</p>
                                    {item.description && (
                                        <p className="text-secondary text-xs mt-1 line-clamp-1">{item.description}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="flex items-center gap-2 bg-primary bg-opacity-20 px-3 py-2 rounded-lg">
                                            <button
                                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                className="text-primary hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110"
                                                disabled={item.quantity <= 1}
                                            >
                                                <MinusIcon className="h-4 w-4" />
                                            </button>
                                            <span className="text-primary font-semibold w-8 text-center">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                className="text-primary hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110"
                                                disabled={isMaxQuantity}
                                            >
                                                <PlusIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                        {remainingStock <= 5 && remainingStock > 0 && (
                                            <p className="text-xs text-yellow-400">{remainingStock} left</p>
                                        )}
                                        {isMaxQuantity && (
                                            <p className="text-xs text-red-400">Max quantity</p>
                                        )}
                                    </div>

                                    <p className="text-primary font-bold w-20 text-right">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </p>

                                    <button
                                        onClick={() => onRemoveItem(item.id)}
                                        className="text-red-400 hover:text-red-300 transition p-2"
                                        title="Remove from cart"
                                    >
                                        <Trash2Icon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Cart Summary */}
                <div className="bg-secondary p-6 rounded-lg border border-border h-fit sticky top-6">
                    <h2 className="text-xl font-bold text-primary mb-4">Order Summary</h2>

                    <div className="space-y-3 mb-6 pb-6 border-b border-border">
                        <div className="flex justify-between text-secondary">
                            <span>Subtotal:</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-secondary">
                            <span>Shipping:</span>
                            <span>Free</span>
                        </div>
                        <div className="flex justify-between text-secondary">
                            <span>Tax (8%):</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex justify-between mb-6 pb-6 border-b border-border">
                        <span className="text-lg font-bold text-primary">Total:</span>
                        <span className="text-lg font-bold text-accent">
                            ${total.toFixed(2)}
                        </span>
                    </div>

                    <button
                        onClick={onCheckout}
                        className="w-full bg-accent text-white py-3 rounded-lg font-semibold transition-all duration-200 hover:bg-white hover:text-black mb-3"
                    >
                        Proceed to Checkout
                    </button>

                    <button
                        onClick={onContinueShopping}
                        className="w-full bg-primary bg-opacity-20 text-primary py-3 rounded-lg font-semibold transition-all duration-200 hover:bg-white hover:text-black"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CartPage;