import React, { useState } from 'react';
// Change these imports:
import { ShoppingCartIcon } from '../components/icons/index.jsx';
// This should work

function LoginPage({ onLogin, onNavigate }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch("http://127.0.0.1:5000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password: password.trim()
                })
            });

            const data = await res.json();

            if (!data.success) {
                setError(data.message);
                setIsLoading(false);
                return;
            }

            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", data.token);
            onLogin(data.user);

        } catch (err) {
            setError("Server error");
        }

        setIsLoading(false);
    };


    return (
        <div className="min-h-screen bg-primary flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-secondary p-8 rounded-xl shadow-md">
                    {/* Header */}
                    <div className="flex items-center justify-center mb-8">
                        <ShoppingCartIcon className="h-8 w-8 text-accent mr-3" />
                        <h1 className="text-3xl font-bold text-primary">SuperShop</h1>
                    </div>

                    <h2 className="text-2xl font-bold text-primary text-center mb-6">Welcome Back</h2>

                    {error && (
                        <div className="mb-4 p-4 bg-red-900 bg-opacity-20 border border-red-500 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-primary text-sm font-medium mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-primary text-sm font-medium mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-accent text-white py-2 rounded-lg font-semibold transition-all duration-200 hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-secondary text-sm">
                            Don't have an account?{' '}
                            <button
                                onClick={() => onNavigate('register')}
                                className="text-accent hover:text-white font-semibold transition"
                            >
                                Register here
                            </button>
                        </p>
                    </div>

                    {/* Demo credentials hint */}
                    <div className="mt-6 pt-6 border-t border-border">
                        <p className="text-secondary text-xs text-center mb-3">Demo Credentials:</p>
                        <div className="space-y-2 text-xs text-secondary bg-primary bg-opacity-20 p-3 rounded">
                            <p><span className="font-semibold">Admin:</span> admin@supershop.com / admin123</p>
                            <p><span className="font-semibold">User:</span> user@supershop.com / user123</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
