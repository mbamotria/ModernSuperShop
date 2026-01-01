import React, { useState } from 'react';
// Change these imports:
import { ShoppingCartIcon } from '../components/icons/index.jsx';
// This should work

function RegisterPage({ onNavigate, onRegister }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('Name is required');
            return false;
        }
        if (!formData.email.includes('@')) {
            setError('Please enter a valid email');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        // Prevent registering with demo credentials
        const normalizedEmail = formData.email.trim().toLowerCase();
        if (normalizedEmail === 'admin@supershop.com' || normalizedEmail === 'user@supershop.com') {
            setError('This email is reserved for demo accounts');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
        const res = await fetch('http://127.0.0.1:5000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                password: formData.password,
            }),
        });

        const data = await res.json();

        if (!data.success) {
            setError(data.message || "Registration failed");
            setIsLoading(false);
            return;
        }

        // Store user + a token if you want
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', `token-${data.user.user_id}`);

        onRegister(data.user);
        setIsLoading(false);

    } catch (err) {
        console.log(err);
        setError("Server unreachable");
        setIsLoading(false);
    }
};

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                <div className="bg-secondary p-8 rounded-xl shadow-md">
                    {/* Header */}
                    <div className="flex items-center justify-center mb-8">
                        <ShoppingCartIcon className="h-8 w-8 text-accent mr-3" />
                        <h1 className="text-3xl font-bold text-primary">SuperShop</h1>
                    </div>

                    <h2 className="text-2xl font-bold text-primary text-center mb-6">Create Account</h2>

                    {error && (
                        <div className="mb-4 p-4 bg-red-900 bg-opacity-20 border border-red-500 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <label className="block text-primary text-sm font-medium mb-2">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-primary text-sm font-medium mb-2">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-primary text-sm font-medium mb-2">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>

                        <div>
                            <label className="block text-primary text-sm font-medium mb-2">Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="2"
                                className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition resize-none"
                                placeholder="123 Main St, City, State"
                            />
                        </div>

                        <div>
                            <label className="block text-primary text-sm font-medium mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label className="block text-primary text-sm font-medium mb-2">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-accent text-white py-2 rounded-lg font-semibold transition-all duration-200 hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {isLoading ? 'Creating Account...' : 'Register'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-secondary text-sm">
                            Already have an account?{' '}
                            <button
                                onClick={() => onNavigate('login')}
                                className="text-accent hover:text-white font-semibold transition"
                            >
                                Sign in here
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
