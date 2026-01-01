// PDF generation utility for receipts
// This uses the browser's built-in print functionality to generate PDF
// For production, consider using libraries like jsPDF or react-pdf

export const generateReceiptPDF = (order, user) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    
    const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Receipt - Order #${order.id}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #111827;
                color: #ffffff;
            }
            .receipt {
                max-width: 600px;
                margin: 0 auto;
                background-color: #1f2937;
                padding: 30px;
                border: 1px solid #374151;
                border-radius: 8px;
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #60a5fa;
                padding-bottom: 20px;
                margin-bottom: 20px;
            }
            .header h1 {
                margin: 0;
                color: #60a5fa;
                font-size: 28px;
            }
            .header p {
                margin: 5px 0;
                color: #d1d5db;
            }
            .order-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid #374151;
            }
            .info-section h3 {
                margin: 0 0 10px 0;
                color: #60a5fa;
                font-size: 14px;
                text-transform: uppercase;
            }
            .info-section p {
                margin: 5px 0;
                color: #d1d5db;
                font-size: 14px;
            }
            .items {
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid #374151;
            }
            .items h3 {
                margin: 0 0 15px 0;
                color: #60a5fa;
                font-size: 16px;
            }
            .item-row {
                display: grid;
                grid-template-columns: 2fr 1fr 1fr 1fr;
                gap: 10px;
                padding: 10px 0;
                border-bottom: 1px solid #374151;
                color: #d1d5db;
                font-size: 14px;
            }
            .item-row.header {
                font-weight: bold;
                color: #60a5fa;
                border-bottom: 2px solid #374151;
            }
            .totals {
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid #374151;
            }
            .total-row {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 10px;
                padding: 8px 0;
                color: #d1d5db;
            }
            .total-row.grand {
                font-weight: bold;
                font-size: 16px;
                color: #60a5fa;
                border-top: 2px solid #374151;
                padding-top: 15px;
                margin-top: 15px;
            }
            .payment-info {
                text-align: center;
                padding-top: 20px;
                color: #9ca3af;
                font-size: 12px;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #374151;
                color: #6b7280;
                font-size: 12px;
            }
            @media print {
                body {
                    background-color: white;
                    color: black;
                }
                .receipt {
                    background-color: white;
                    color: black;
                    border: 1px solid #ccc;
                }
            }
        </style>
    </head>
    <body>
        <div class="receipt">
            <div class="header">
                <h1>SuperShop</h1>
                <p>Receipt</p>
                <p style="color: #60a5fa; font-weight: bold;">Order #${order.id}</p>
            </div>
            
            <div class="order-info">
                <div class="info-section">
                    <h3>Order Details</h3>
                    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${new Date(order.createdAt).toLocaleTimeString()}</p>
                    <p><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
                </div>
                <div class="info-section">
                    <h3>Customer Info</h3>
                    <p><strong>${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName}</strong></p>
                    <p>${order.shippingAddress?.email}</p>
                    <p>${order.shippingAddress?.phone}</p>
                </div>
            </div>
            
            <div class="order-info">
                <div class="info-section">
                    <h3>Shipping Address</h3>
                    <p>${order.shippingAddress?.address}</p>
                    <p>${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.zipCode}</p>
                </div>
                <div class="info-section">
                    <h3>Payment Method</h3>
                    <p>${order.paymentMethod ? order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1) : 'Card'}</p>
                </div>
            </div>
            
            <div class="items">
                <h3>Order Items</h3>
                <div class="item-row header">
                    <div>Product</div>
                    <div>Qty</div>
                    <div>Price</div>
                    <div>Total</div>
                </div>
                ${order.items?.map(item => `
                    <div class="item-row">
                        <div>${item.name}</div>
                        <div>${item.quantity}</div>
                        <div>$${item.price.toFixed(2)}</div>
                        <div>$${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="totals">
                <div class="total-row">
                    <div>Subtotal:</div>
                    <div>$${(order.total / 1.08).toFixed(2)}</div>
                </div>
                <div class="total-row">
                    <div>Tax (8%):</div>
                    <div>$${(order.total * 0.08 / 1.08).toFixed(2)}</div>
                </div>
                <div class="total-row">
                    <div>Shipping:</div>
                    <div>Free</div>
                </div>
                <div class="total-row grand">
                    <div>Total Amount:</div>
                    <div>$${order.total.toFixed(2)}</div>
                </div>
            </div>
            
            <div class="payment-info">
                <p>Thank you for your purchase!</p>
                <p>Order confirmation has been sent to your email.</p>
            </div>
            
            <div class="footer">
                <p>This is an automated receipt. Please do not reply to this message.</p>
                <p>SuperShop &copy; ${new Date().getFullYear()} - All rights reserved</p>
            </div>
        </div>
        
        <script>
            window.onload = function() {
                window.print();
                window.onafterprint = function() {
                    window.close();
                };
            };
        </script>
    </body>
    </html>
    `;
    
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
};
