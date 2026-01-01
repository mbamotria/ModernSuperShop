import React, { useState } from 'react';

function ProfilePage({ user, onUpdateProfile, onLogout }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            // Call backend API to update profile
            const response = await fetch(`http://127.0.0.1:5000/user/${user.user_id}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone || '',
                    address: formData.address || '',
                }),
            });

            const data = await response.json();

            if (!data.success) {
                setError(data.message || "Failed to update profile");
                setIsLoading(false);
                return;
            }

            // Update local state and localStorage
            const updatedUser = {
                ...user,
                name: data.user.name,
                phone: data.user.phone,
                address: data.user.address,
            };
            
            localStorage.setItem('user', JSON.stringify(updatedUser));
            onUpdateProfile(updatedUser);
            setSuccess(data.message || 'Profile updated successfully');
            setIsEditing(false);
            setIsLoading(false);

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Update profile error:', err);
            setError("Network error. Please try again.");
            setIsLoading(false);
        }
    };

    // Calculate stats - now using localStorage orders
    const userOrders = JSON.parse(localStorage.getItem('orders') || '[]')
        .filter(order => order.userId === user?.user_id || order.userId === user?.id);
    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    // Format created_at date
    const formatDate = (dateString) => {
        if (!dateString) return 'Today';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            

            {error && (
                <div className="p-4 bg-red-900 bg-opacity-20 border border-red-500 rounded-lg">
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-900 bg-opacity-20 border border-green-500 rounded-lg">
                    <p className="text-green-400">{success}</p>
                </div>
            )}

            <div className="bg-secondary p-6 rounded-lg border border-border max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-primary">Account Information</h2>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-4 py-2 bg-accent text-white rounded-lg font-semibold transition-all duration-200 hover:bg-white hover:text-black"
                    >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-primary text-sm font-medium mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div>
                            <label className="block text-primary text-sm font-medium mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled
                                className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-secondary opacity-50 cursor-not-allowed"
                            />
                            <p className="text-xs text-secondary mt-1">Email cannot be changed</p>
                        </div>

                        <div>
                            <label className="block text-primary text-sm font-medium mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>

                        <div>
                            <label className="block text-primary text-sm font-medium mb-2">
                                Address
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-2 bg-primary bg-opacity-20 border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                                placeholder="Enter your address"
                            />
                        </div>

                        <div className="pt-4 border-t border-border">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-accent text-white py-2 rounded-lg font-semibold transition-all duration-200 hover:bg-white hover:text-black disabled:opacity-50"
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="pb-3 border-b border-border">
                            <p className="text-secondary text-sm">Full Name</p>
                            <p className="text-primary font-semibold text-lg">{formData.name}</p>
                        </div>

                        <div className="pb-3 border-b border-border">
                            <p className="text-secondary text-sm">Email Address</p>
                            <p className="text-primary font-semibold text-lg">{formData.email}</p>
                        </div>

                        <div className="pb-3 border-b border-border">
                            <p className="text-secondary text-sm">Phone Number</p>
                            <p className="text-primary font-semibold text-lg">
                                {formData.phone || 'Not provided'}
                            </p>
                        </div>

                        <div className="pb-3 border-b border-border">
                            <p className="text-secondary text-sm">Address</p>
                            <p className="text-primary font-semibold text-lg whitespace-pre-line">
                                {formData.address || 'Not provided'}
                            </p>
                        </div>

                        <div className="pt-2">
                            <p className="text-secondary text-sm">Role</p>
                            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                user.role === 'admin' 
                                    ? 'bg-purple-900/20 text-purple-400' 
                                    : 'bg-blue-900/20 text-blue-400'
                            }`}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Account Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-secondary p-4 rounded-lg border border-border">
                    <p className="text-secondary text-sm mb-2">Member Since</p>
                    <p className="text-primary font-bold text-lg">
                        {formatDate(user?.created_at)}
                    </p>
                </div>
                <div className="bg-secondary p-4 rounded-lg border border-border">
                    <p className="text-secondary text-sm mb-2">Total Orders</p>
                    <p className="text-primary font-bold text-lg">{totalOrders}</p>
                </div>
                <div className="bg-secondary p-4 rounded-lg border border-border">
                    <p className="text-secondary text-sm mb-2">Total Spent</p>
                    <p className="text-primary font-bold text-lg">
                        ${totalSpent.toFixed(2)}
                    </p>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary"></h1>
                <button
                    onClick={onLogout}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold transition-all duration-200 hover:bg-white hover:text-black"
                >
                    Logout
                </button>
            </div>

            
        </div>
    );
}

export default ProfilePage;