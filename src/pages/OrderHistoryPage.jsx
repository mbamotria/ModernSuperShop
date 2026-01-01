import React, { useState, useEffect } from 'react';
import { 
    Package, 
    Calendar, 
    DollarSign, 
    CheckCircle, 
    Clock, 
    XCircle, 
    Download,
    FileText 
} from '../components/icons/index.jsx';
import { generateReceiptPDF, generateSimpleReceipt } from '../utils/receiptGenerator';

function OrderHistoryPage() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [viewMode, setViewMode] = useState('api');
    const [user, setUser] = useState(null);
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        fetchOrders();
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(storedUser);
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        setError('');

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            
            if (!user || !user.user_id) {
                throw new Error('User not found');
            }

            // Try to fetch from API first
            try {
                const response = await fetch(`http://127.0.0.1:5000/user/${user.user_id}/orders`);
                
                if (response.ok) {
                    const apiData = await response.json();
                    
                    if (apiData.success && apiData.orders) {
                        setOrders(apiData.orders);
                        setViewMode('api');
                        setIsLoading(false);
                        return;
                    }
                }
            } catch (apiError) {
                console.log('API fetch failed, falling back to localStorage:', apiError);
                setViewMode('local');
            }

            // Fallback to localStorage
            const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            const userOrders = allOrders.filter(order => 
                order.userId === user.user_id || order.userId === user.id
            );
            
            setOrders(userOrders);
            
        } catch (err) {
            setError('Failed to fetch orders. Please try again later.');
            console.error('Fetch orders error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchOrders();
    };

    const handleDownloadReceipt = async (order) => {
        if (!order) return;
        
        setDownloading(order.id);
        
        try {
            // Get current user
            const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');
            
            // Try main receipt generator first
            try {
                await generateReceiptPDF(order, currentUser);
                console.log(`Receipt downloaded for order #${order.id}`);
            } catch (error) {
                console.warn('Main receipt failed, trying simple version:', error);
                
                // Fallback to simple receipt
                await generateSimpleReceipt(order, currentUser);
                console.log(`Simple receipt downloaded for order #${order.id}`);
            }
            
        } catch (error) {
            console.error('All receipt generation failed:', error);
            
            // Ultimate fallback: Basic PDF
            try {
                const { jsPDF } = await import('jspdf');
                const doc = new jsPDF();
                
                doc.setFontSize(16);
                doc.text("RECEIPT", 105, 20, { align: 'center' });
                
                doc.setFontSize(12);
                doc.text(`Order #${order.id}`, 20, 40);
                doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 20, 50);
                doc.text(`Total: $${order.total}`, 20, 60);
                
                doc.setFontSize(10);
                doc.text("Thank you for your purchase!", 105, 80, { align: 'center' });
                
                doc.save(`Receipt_${order.id}.pdf`);
                
            } catch (finalError) {
                console.error('Basic PDF also failed:', finalError);
                setError('Failed to generate receipt. Please try again later.');
            }
        } finally {
            setTimeout(() => setDownloading(null), 500);
        }
    };

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'processing':
                return <Clock className="h-5 w-5 text-blue-500" />;
            case 'pending':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'cancelled':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Clock className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-900 bg-opacity-20 text-green-400 border-green-500';
            case 'processing':
                return 'bg-blue-900 bg-opacity-20 text-blue-400 border-blue-500';
            case 'pending':
                return 'bg-yellow-900 bg-opacity-20 text-yellow-400 border-yellow-500';
            case 'cancelled':
                return 'bg-red-900 bg-opacity-20 text-red-400 border-red-500';
            default:
                return 'bg-gray-900 bg-opacity-20 text-gray-400 border-gray-500';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Date not available';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Invalid date';
            }
            
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
                    <p className="text-primary text-lg font-semibold">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {viewMode === 'local' && (
                        <span className="text-yellow-400 text-sm bg-yellow-900/20 px-3 py-1 rounded-full">
                            Using offline data
                        </span>
                    )}
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-accent text-white rounded-lg font-semibold transition-all duration-200 hover:bg-white hover:text-black"
                    >
                        Refresh Orders
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-900 bg-opacity-20 border border-red-500 rounded-lg">
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            {orders.length === 0 ? (
                <div className="bg-secondary p-12 rounded-lg border border-border text-center">
                    <Package className="h-16 w-16 text-secondary mx-auto mb-4 opacity-50" />
                    <h2 className="text-2xl font-bold text-primary mb-2">No Orders Yet</h2>
                    <p className="text-secondary mb-8">Start shopping to see your order history here</p>
                    <div className="text-sm text-secondary bg-primary bg-opacity-10 p-4 rounded-lg max-w-md mx-auto">
                        <p className="mb-2">Your orders will appear here after you make a purchase.</p>
                        <p>Orders are stored {viewMode === 'api' ? 'in our database' : 'locally on your device'}.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="text-sm text-secondary mb-2">
                        Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
                        {viewMode === 'local' && ' (offline mode)'}
                    </div>
                    
                    {orders.map((order) => (
                        <div key={order.id} className="bg-secondary border border-border rounded-lg overflow-hidden">
                            {/* Order Header */}
                            <div className="w-full p-4 flex items-center justify-between">
                                <div className="flex-1">
                                    <button
                                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                        className="w-full text-left hover:bg-primary hover:bg-opacity-10 transition p-2 rounded-lg flex items-center gap-4"
                                    >
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(order.status)}
                                            <div>
                                                <p className="text-primary font-semibold">
                                                    Order #{order.id}
                                                </p>
                                                <div className="flex items-center gap-2 text-secondary text-sm mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(order.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </div>
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-primary font-bold text-lg flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            ${typeof order.total === 'number' ? order.total.toFixed(2) : parseFloat(order.total || 0).toFixed(2)}
                                        </p>
                                        <p className="text-accent text-sm">
                                            {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    
                                    {/* Download Button in Header */}
                                    <button
                                        onClick={() => handleDownloadReceipt(order)}
                                        disabled={downloading === order.id}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all duration-200 ${
                                            downloading === order.id 
                                                ? 'bg-blue-800 cursor-not-allowed' 
                                                : 'bg-blue-600 hover:bg-blue-700'
                                        } text-white`}
                                        title="Download Receipt"
                                    >
                                        {downloading === order.id ? (
                                            <>
                                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                                <span className="text-sm">Generating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Download className="h-4 w-4" />
                                                <span className="text-sm">Receipt</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Order Details */}
                            {expandedOrder === order.id && (
                                <div className="border-t border-border p-4 space-y-6 bg-primary bg-opacity-5">
                                    {/* Download Receipt Section */}
                                    <div className="bg-blue-900 bg-opacity-10 border border-blue-500 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-6 w-6 text-blue-400" />
                                                <div>
                                                    <h4 className="text-primary font-semibold">Download Receipt</h4>
                                                    <p className="text-secondary text-sm">Get a printable PDF of your order details</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDownloadReceipt(order)}
                                                disabled={downloading === order.id}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                                                    downloading === order.id 
                                                        ? 'bg-blue-800 cursor-not-allowed' 
                                                        : 'bg-blue-600 hover:bg-blue-700'
                                                } text-white`}
                                            >
                                                {downloading === order.id ? (
                                                    <>
                                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                                        <span>Generating PDF...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="h-4 w-4" />
                                                        <span>Download Receipt</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <div className="mt-3 text-xs text-secondary flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            Includes all order details, items, and payment summary
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div>
                                        <h4 className="text-primary font-semibold mb-3 flex items-center gap-2">
                                            <Package className="h-4 w-4" />
                                            Order Items
                                        </h4>
                                        <div className="space-y-3">
                                            {order.items?.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center p-3 bg-primary bg-opacity-10 rounded-lg">
                                                    <div className="flex-1">
                                                        <p className="text-primary font-medium">{item.name}</p>
                                                        <p className="text-secondary text-sm">${typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price || 0).toFixed(2)} each</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-primary">x{item.quantity}</p>
                                                        <p className="text-accent font-semibold">
                                                            ${(typeof item.price === 'number' ? item.price : parseFloat(item.price || 0)) * item.quantity}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Payment Summary */}
                                    <div className="border-t border-border pt-4">
                                        <h4 className="text-primary font-semibold mb-3">Payment Summary</h4>
                                        <div className="space-y-2 text-secondary">
                                            <div className="flex justify-between">
                                                <span>Subtotal:</span>
                                                <span>${(typeof order.total === 'number' ? order.total / 1.08 : parseFloat(order.total || 0) / 1.08).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Tax (8%):</span>
                                                <span>${(typeof order.total === 'number' ? order.total * 0.08 / 1.08 : parseFloat(order.total || 0) * 0.08 / 1.08).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between pt-2 border-t border-border mt-2">
                                                <span className="text-primary font-semibold">Total:</span>
                                                <span className="text-accent font-semibold">
                                                    ${typeof order.total === 'number' ? order.total.toFixed(2) : parseFloat(order.total || 0).toFixed(2)}
                                                </span>
                                            </div>
                                            {order.payment_method && (
                                                <div className="mt-2 pt-2 border-t border-border">
                                                    <span className="text-secondary">Payment Method: </span>
                                                    <span className="text-primary font-medium capitalize">{order.payment_method}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Info */}
                                    <div className="border-t border-border pt-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-secondary">Order ID</p>
                                                <p className="text-primary font-mono">{order.id}</p>
                                            </div>
                                            <div>
                                                <p className="text-secondary">Order Date</p>
                                                <p className="text-primary">{formatDate(order.created_at)}</p>
                                            </div>
                                            <div>
                                                <p className="text-secondary">Status</p>
                                                <p className={`font-semibold ${getStatusColor(order.status).split(' ')[2]}`}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-secondary">Items Count</p>
                                                <p className="text-primary">{order.items?.length || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default OrderHistoryPage;