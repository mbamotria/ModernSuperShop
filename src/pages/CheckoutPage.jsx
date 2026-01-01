import React, { useState } from 'react';

function CheckoutPage({ cart, user, onPlaceOrder, total }) {
    const [formData, setFormData] = useState({
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ').slice(1).join(' ') || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: '',
        state: '',
        zipCode: '',
        paymentMethod: 'card',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // Modify the handleSubmit function to update stock via API:
const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        // Create order via API
        const orderResponse = await fetch("http://127.0.0.1:5000/orders", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: user?.user_id,
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price
                }))
            })
        });

        const orderData = await orderResponse.json();

        if (orderData.success) {
            // Create a proper order object for localStorage
            const orderToStore = {
                id: orderData.order_id,
                userId: user.user_id,
                total: finalTotal,
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                shippingAddress: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode
                },
                paymentMethod: formData.paymentMethod,
                status: 'completed',
                createdAt: new Date().toISOString() // Use ISO string format
            };

            // Get existing orders from localStorage
            const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            existingOrders.push(orderToStore);
            localStorage.setItem('orders', JSON.stringify(existingOrders));

            // Clear cart after successful order
            await fetch(`http://127.0.0.1:5000/cart/clear/${user.user_id}`, {
                method: 'DELETE'
            });
            
            setIsLoading(false);
            onPlaceOrder(orderToStore);
        } else {
            setError(orderData.message || "Failed to place order");
            setIsLoading(false);
        }
    } catch (err) {
        console.error("Order error:", err);
        setError("Network error. Please try again.");
        setIsLoading(false);
    }
};

    const taxAmount = total * 0.08;
    const finalTotal = total + taxAmount;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Checkout</h1>

            {error && (
                <div className="p-4 bg-red-900 bg-opacity-20 border border-red-500 rounded-lg">
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-3 gap-6">
                {/* Checkout Form */}
                <div className="col-span-2 bg-secondary p-6 rounded-lg border border-border">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Shipping Information */}
                        <div>
                            <h2 className="text-xl font-bold text-primary mb-4">Shipping Address</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-primary text-sm font-medium mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-primary text-sm font-medium mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-primary text-sm font-medium mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-primary text-sm font-medium mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-primary text-sm font-medium mb-2">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-primary text-sm font-medium mb-2">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-primary text-sm font-medium mb-2">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-primary text-sm font-medium mb-2">
                                        ZIP Code
                                    </label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="pt-6 border-t border-border">
                            <h2 className="text-xl font-bold text-primary mb-4">Payment Method</h2>
                            <div className="space-y-3">
                                {['card', 'cash', 'bkash', 'nagad'].map((method) => (
                                    <label key={method} className="flex items-center p-3 border border-border rounded-lg cursor-pointer hover:bg-primary hover:bg-opacity-10 transition">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method}
                                            checked={formData.paymentMethod === method}
                                            onChange={handleChange}
                                            className="w-4 h-4"
                                        />
                                        <span className="ml-3 text-primary font-medium capitalize">
                                            {method === 'bkash' ? 'bKash' : method === 'nagad' ? 'Nagad' : method.charAt(0).toUpperCase() + method.slice(1)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-accent text-white py-3 rounded-lg font-semibold transition-all duration-200 hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                            {isLoading ? 'Processing...' : 'Place Order'}
                        </button>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="bg-secondary p-6 rounded-lg border border-border h-fit sticky top-6">
                    <h2 className="text-xl font-bold text-primary mb-4">Order Summary</h2>

                    <div className="space-y-3 max-h-96 overflow-y-auto mb-6 pb-6 border-b border-border">
                        {cart.map((item) => (
                            <div key={item.id} className="flex justify-between text-secondary text-sm">
                                <span>{item.name} x{item.quantity}</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3 mb-6 pb-6 border-b border-border">
                        <div className="flex justify-between text-secondary">
                            <span>Subtotal:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-secondary">
                            <span>Shipping:</span>
                            <span>Free</span>
                        </div>
                        <div className="flex justify-between text-secondary">
                            <span>Tax (8%):</span>
                            <span>${taxAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-lg font-bold text-primary">Total:</span>
                        <span className="text-lg font-bold text-accent">
                            ${finalTotal.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;
