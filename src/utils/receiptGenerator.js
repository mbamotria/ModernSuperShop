import { jsPDF } from 'jspdf';

// Simple receipt generator without autoTable dependency
export const generateReceiptPDF = (order, user) => {
    try {
        // Create new PDF document
        const doc = new jsPDF();
        
        // Company Information
        const companyInfo = {
            name: "SUPERSHOP",
            address: "123 Shopping Street, Digital City",
            phone: "+1 (555) 123-4567",
            email: "info@supershop.com"
        };
        
        // Header
        doc.setFillColor(0, 51, 102); // Dark blue
        doc.rect(0, 0, 210, 30, 'F');
        
        // Company name
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(companyInfo.name, 105, 15, { align: 'center' });
        
        // Tagline
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text("Quality Products, Excellent Service", 105, 22, { align: 'center' });
        
        // Reset text color
        doc.setTextColor(0, 0, 0);
        
        // Receipt title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text("ORDER RECEIPT", 105, 40, { align: 'center' });
        
        // Separator line
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 45, 190, 45);
        
        let yPos = 55;
        
        // Order Information
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text("Order Information", 20, yPos);
        yPos += 10;
        
        const orderDate = order.created_at ? new Date(order.created_at) : new Date();
        const formattedDate = orderDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Order details
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Order ID: #${order.id}`, 25, yPos);
        doc.text(`Date: ${formattedDate}`, 120, yPos);
        yPos += 7;
        
        doc.text(`Customer: ${user?.name || 'Guest Customer'}`, 25, yPos);
        doc.text(`Status: ${order.status.toUpperCase()}`, 120, yPos);
        yPos += 7;
        
        if (user?.email) {
            doc.text(`Email: ${user.email}`, 25, yPos);
            yPos += 7;
        }
        
        yPos += 5;
        
        // Items header
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text("Order Items", 20, yPos);
        yPos += 8;
        
        // Draw table header
        doc.setFillColor(0, 51, 102);
        doc.rect(20, yPos, 170, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text("Item", 25, yPos + 6);
        doc.text("Price", 110, yPos + 6);
        doc.text("Qty", 140, yPos + 6);
        doc.text("Total", 180, yPos + 6, { align: 'right' });
        
        yPos += 8;
        doc.setTextColor(0, 0, 0);
        
        // Items list
        let subtotal = 0;
        
        order.items?.forEach((item, index) => {
            const rowY = yPos + (index * 12);
            const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);
            const itemTotal = itemPrice * item.quantity;
            subtotal += itemTotal;
            
            // Alternate row background
            if (index % 2 === 0) {
                doc.setFillColor(240, 240, 240);
                doc.rect(20, rowY, 170, 12, 'F');
            }
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            
            // Item name (truncate if too long)
            const itemName = item.name.length > 25 ? item.name.substring(0, 22) + '...' : item.name;
            doc.text(itemName, 25, rowY + 8, { maxWidth: 80 });
            
            // Price
            doc.text(`$${itemPrice.toFixed(2)}`, 110, rowY + 8);
            
            // Quantity
            doc.text(item.quantity.toString(), 140, rowY + 8);
            
            // Total
            doc.text(`$${itemTotal.toFixed(2)}`, 180, rowY + 8, { align: 'right' });
        });
        
        // Update yPos after items
        const itemsCount = order.items?.length || 0;
        yPos += (itemsCount * 12) + 15;
        
        // Payment Summary
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text("Payment Summary", 20, yPos);
        yPos += 10;
        
        const taxRate = 0.08;
        const tax = subtotal * taxRate;
        const total = subtotal + tax;
        
        // Draw summary table
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        // Subtotal
        doc.text("Subtotal:", 120, yPos);
        doc.text(`$${subtotal.toFixed(2)}`, 180, yPos, { align: 'right' });
        yPos += 7;
        
        // Tax
        doc.text(`Tax (8%):`, 120, yPos);
        doc.text(`$${tax.toFixed(2)}`, 180, yPos, { align: 'right' });
        yPos += 10;
        
        // Separator line
        doc.setDrawColor(150, 150, 150);
        doc.line(120, yPos, 190, yPos);
        yPos += 5;
        
        // Total
        doc.setFont('helvetica', 'bold');
        doc.text("Total:", 120, yPos);
        doc.text(`$${total.toFixed(2)}`, 180, yPos, { align: 'right' });
        yPos += 7;
        
        // Payment Method
        if (order.payment_method) {
            doc.setFont('helvetica', 'normal');
            doc.text(`Payment Method: ${order.payment_method.toUpperCase()}`, 120, yPos);
            yPos += 7;
        }
        
        yPos += 10;
        
        // Footer
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPos, 190, yPos);
        yPos += 10;
        
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'normal');
        doc.text(companyInfo.address, 105, yPos, { align: 'center' });
        yPos += 5;
        doc.text(`Phone: ${companyInfo.phone} | Email: ${companyInfo.email}`, 105, yPos, { align: 'center' });
        yPos += 10;
        
        // Thank you message
        doc.setFontSize(10);
        doc.setTextColor(0, 102, 0);
        doc.setFont('helvetica', 'bold');
        doc.text("Thank you for your purchase!", 105, yPos, { align: 'center' });
        
        yPos += 15;
        
        // Generation info
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'italic');
        doc.text(`Receipt ID: RC-${order.id}-${Date.now().toString().slice(-6)}`, 105, yPos, { align: 'center' });
        yPos += 5;
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, yPos, { align: 'center' });
        
        // Save PDF
        const fileName = `Supershop_Receipt_${order.id}.pdf`;
        doc.save(fileName);
        
        return fileName;
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};

// Alternative ultra-simple receipt (as fallback)
export const generateSimpleReceipt = (order, user) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text("SUPERSHOP", 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text("Receipt", 105, 30, { align: 'center' });
    
    // Order info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order #${order.id}`, 20, 45);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 20, 52);
    
    if (user?.name) {
        doc.text(`Customer: ${user.name}`, 20, 59);
    }
    
    // Items
    doc.setFont('helvetica', 'bold');
    doc.text("Items:", 20, 72);
    
    let yPos = 80;
    let total = 0;
    
    order.items?.forEach((item) => {
        const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);
        const itemTotal = itemPrice * item.quantity;
        total += itemTotal;
        
        doc.setFont('helvetica', 'normal');
        doc.text(`${item.name}`, 25, yPos);
        doc.text(`$${itemTotal.toFixed(2)}`, 180, yPos, { align: 'right' });
        yPos += 7;
    });
    
    // Total
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: $${total.toFixed(2)}`, 180, yPos, { align: 'right' });
    
    // Footer
    yPos += 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text("Thank you for shopping with us!", 105, yPos, { align: 'center' });
    
    const fileName = `Receipt_${order.id}.pdf`;
    doc.save(fileName);
    
    return fileName;
};