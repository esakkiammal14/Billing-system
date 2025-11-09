// Default menu items with images from free sources
const defaultMenuItems = [
    {
        id: 1,
        name: 'Idly',
        price: 30,
        category: 'morning',
        imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop&auto=format'
    },
    {
        id: 2,
        name: 'Puttu',
        price: 40,
        category: 'morning',
        imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&auto=format'
    },
    {
        id: 3,
        name: 'Poori',
        price: 35,
        category: 'morning',
        imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop&auto=format'
    },
    {
        id: 4,
        name: 'Coffee',
        price: 25,
        category: 'morning',
        imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop&auto=format'
    },
    {
        id: 5,
        name: 'Dosa',
        price: 50,
        category: 'lunch',
        imageUrl: 'https://images.unsplash.com/photo-1612929633736-8fe0c9aaa5a8?w=400&h=300&fit=crop&auto=format'
    },
    {
        id: 6,
        name: 'Vada',
        price: 30,
        category: 'morning',
        imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&auto=format'
    },
    {
        id: 7,
        name: 'Chicken Biryani',
        price: 150,
        category: 'dinner',
        imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop&auto=format'
    },
    {
        id: 8,
        name: 'Fried Rice',
        price: 120,
        category: 'dinner',
        imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop&auto=format'
    }
];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeMenu();
    displayMenu();
    loadCart();
    setupEventListeners();
});

// Initialize menu in localStorage
function initializeMenu() {
    if (!localStorage.getItem('menuItems')) {
        localStorage.setItem('menuItems', JSON.stringify(defaultMenuItems));
    } else {
        // Migrate old menu items to include category
        const menuItems = JSON.parse(localStorage.getItem('menuItems') || '[]');
        let needsUpdate = false;
        menuItems.forEach(item => {
            if (!item.category) {
                item.category = 'morning'; // Default category for old items
                needsUpdate = true;
            }
        });
        if (needsUpdate) {
            localStorage.setItem('menuItems', JSON.stringify(menuItems));
        }
    }
    if (!localStorage.getItem('adminPassword')) {
        localStorage.setItem('adminPassword', 'iniya2005');
    }
    if (!localStorage.getItem('salesHistory')) {
        localStorage.setItem('salesHistory', JSON.stringify([]));
    }
}

// Get menu items from localStorage
function getMenuItems() {
    return JSON.parse(localStorage.getItem('menuItems') || '[]');
}

// Save menu items to localStorage
function saveMenuItems(items) {
    localStorage.setItem('menuItems', JSON.stringify(items));
}

// Current selected category
let currentCategory = 'all';

// Display menu items
function displayMenu(category = 'all') {
    const menuGrid = document.getElementById('menuGrid');
    const menuItems = getMenuItems();
    
    menuGrid.innerHTML = '';
    
    if (menuItems.length === 0) {
        menuGrid.innerHTML = '<p>No menu items available</p>';
        return;
    }
    
    // Filter items by category
    const filteredItems = category === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category === category);
    
    if (filteredItems.length === 0) {
        menuGrid.innerHTML = `<p>No items available in ${category} category</p>`;
        return;
    }
    
    filteredItems.forEach(item => {
        const menuItemDiv = document.createElement('div');
        menuItemDiv.className = 'menu-item';
        menuItemDiv.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x150/4CAF50/ffffff?text=${encodeURIComponent(item.name)}'">
            <div class="menu-item-info">
                <div class="menu-item-name">${item.name}</div>
                <div class="menu-item-price">₹${item.price.toFixed(2)}</div>
            </div>
        `;
        menuItemDiv.addEventListener('click', () => addToCart(item));
        menuGrid.appendChild(menuItemDiv);
    });
}

// Cart Management
function getCartItems() {
    return JSON.parse(localStorage.getItem('cartItems') || '[]');
}

function saveCartItems(items) {
    localStorage.setItem('cartItems', JSON.stringify(items));
    updateCart();
}

function addToCart(item) {
    const cartItems = getCartItems();
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        });
    }
    
    saveCartItems(cartItems);
    showNotification(`${item.name} added to cart!`);
}

function removeFromCart(itemId) {
    const cartItems = getCartItems();
    const filteredItems = cartItems.filter(item => item.id !== itemId);
    saveCartItems(filteredItems);
}

function updateQuantity(itemId, change) {
    const cartItems = getCartItems();
    const item = cartItems.find(cartItem => cartItem.id === itemId);
    
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        saveCartItems(cartItems);
    }
}

function clearCart() {
    if (confirm('Are you sure you want to clear the cart?')) {
        localStorage.removeItem('cartItems');
        updateCart();
    }
}

function loadCart() {
    updateCart();
}

function updateCart() {
    const cartItems = getCartItems();
    const cartItemsDiv = document.getElementById('cartItems');
    const billSummary = document.getElementById('billSummary');
    
    if (cartItems.length === 0) {
        cartItemsDiv.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        billSummary.style.display = 'none';
        return;
    }
    
    billSummary.style.display = 'block';
    cartItemsDiv.innerHTML = '';
    
    cartItems.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        cartItemDiv.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price.toFixed(2)} each</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `;
        cartItemsDiv.appendChild(cartItemDiv);
    });
    
    calculateBill();
}

function calculateBill() {
    const cartItems = getCartItems();
    let total = 0;
    
    cartItems.forEach(item => {
        total += item.price * item.quantity;
    });
    
    document.getElementById('subtotal').textContent = `₹${total.toFixed(2)}`;
    document.getElementById('tax').textContent = `₹0.00`;
    document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
}

// Payment and QR Code
function generateQRCode() {
    const cartItems = getCartItems();
    
    if (cartItems.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const total = calculateTotal();
    const orderId = 'ORD-' + Date.now();
    const timestamp = new Date().toLocaleString();
    
    // Payment details string
    const paymentDetails = `Order ID: ${orderId}\nAmount: ₹${total.toFixed(2)}\nDate: ${timestamp}\nRestaurant Billing System`;
    
    // Generate QR code
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    
    const canvas = document.createElement('canvas');
    qrContainer.appendChild(canvas);
    
    QRCode.toCanvas(canvas, paymentDetails, {
        width: 250,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    }, function (error) {
        if (error) {
            console.error('QR Code generation error:', error);
            qrContainer.innerHTML = '<p>Error generating QR code</p>';
        }
    });
    
    // Display payment details
    document.getElementById('paymentDetails').innerHTML = `
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Total Amount:</strong> ₹${total.toFixed(2)}</p>
        <p><strong>Date & Time:</strong> ${timestamp}</p>
    `;
    
    // Show modal
    document.getElementById('qrModal').style.display = 'block';
    
    // Save sale to history
    saveSale(orderId, total, timestamp);
}

function calculateTotal() {
    const cartItems = getCartItems();
    let total = 0;
    
    cartItems.forEach(item => {
        total += item.price * item.quantity;
    });
    
    return total;
}

function saveSale(orderId, total, timestamp) {
    const cartItems = getCartItems();
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory') || '[]');
    
    // Calculate total properly
    let subtotal = 0;
    cartItems.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    const sale = {
        orderId: orderId,
        date: timestamp,
        items: cartItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        subtotal: subtotal,
        tax: 0,
        total: total,
        timestamp: new Date().getTime()
    };
    
    salesHistory.push(sale);
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
    
    // Clear cart after payment
    localStorage.removeItem('cartItems');
    updateCart();
}

// Print Bill
function printBill() {
    const cartItems = getCartItems();
    
    if (cartItems.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const orderId = 'ORD-' + Date.now();
    const date = new Date().toLocaleString();
    
    // Calculate total properly
    let total = 0;
    cartItems.forEach(item => {
        total += item.price * item.quantity;
    });
    
    // Set print bill content
    document.getElementById('printOrderId').textContent = `Order ID: ${orderId}`;
    document.getElementById('printDate').textContent = `Date: ${date}`;
    
    const printItemsDiv = document.getElementById('printItems');
    printItemsDiv.innerHTML = '';
    
    cartItems.forEach(item => {
        const printItemDiv = document.createElement('div');
        printItemDiv.className = 'print-item';
        printItemDiv.innerHTML = `
            <span>${item.name} x ${item.quantity}</span>
            <span>₹${(item.price * item.quantity).toFixed(2)}</span>
        `;
        printItemsDiv.appendChild(printItemDiv);
    });
    
    document.getElementById('printSubtotal').textContent = `₹${total.toFixed(2)}`;
    document.getElementById('printTax').textContent = `₹0.00`;
    document.getElementById('printTotal').textContent = `₹${total.toFixed(2)}`;
    
    // Show print section and print
    document.getElementById('printBill').style.display = 'block';
    window.print();
    document.getElementById('printBill').style.display = 'none';
}

// Admin Panel
function toggleAdminMode() {
    const modal = document.getElementById('adminModal');
    const adminLogin = document.getElementById('adminLogin');
    const adminPanel = document.getElementById('adminPanel');
    
    // Reset form
    document.getElementById('adminPassword').value = '';
    adminLogin.style.display = 'block';
    adminPanel.style.display = 'none';
    
    modal.style.display = 'block';
}

function loginAdmin() {
    const password = document.getElementById('adminPassword').value;
    const storedPassword = localStorage.getItem('adminPassword');
    
    if (password === storedPassword) {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        displayAdminMenu();
    } else {
        alert('Incorrect password!');
    }
}

function displayAdminMenu() {
    const adminMenuList = document.getElementById('adminMenuList');
    const menuItems = getMenuItems();
    
    adminMenuList.innerHTML = '';
    
    menuItems.forEach(item => {
        const adminItemDiv = document.createElement('div');
        adminItemDiv.className = 'admin-menu-item';
        adminItemDiv.innerHTML = `
            <div class="admin-menu-item-info">
                <h4>${item.name}</h4>
                <p>Price: ₹${item.price.toFixed(2)}</p>
            </div>
            <div class="admin-menu-item-actions">
                <button class="btn-edit" onclick="editMenuItem(${item.id})">Edit</button>
                <button class="btn-delete" onclick="deleteMenuItem(${item.id})">Delete</button>
            </div>
        `;
        adminMenuList.appendChild(adminItemDiv);
    });
}

function addMenuItem() {
    const name = document.getElementById('itemName').value.trim();
    const price = parseFloat(document.getElementById('itemPrice').value);
    const imageUrl = document.getElementById('itemImage').value.trim();
    const category = document.getElementById('itemCategory').value;
    
    if (!name || !price || !imageUrl || !category) {
        alert('Please fill all fields!');
        return;
    }
    
    if (price <= 0) {
        alert('Price must be greater than 0!');
        return;
    }
    
    const menuItems = getMenuItems();
    const newId = menuItems.length > 0 ? Math.max(...menuItems.map(item => item.id)) + 1 : 1;
    
    menuItems.push({
        id: newId,
        name: name,
        price: price,
        category: category,
        imageUrl: imageUrl
    });
    
    saveMenuItems(menuItems);
    displayMenu(currentCategory);
    displayAdminMenu();
    
    // Reset form
    document.getElementById('addItemForm').reset();
    showNotification('Item added successfully!');
}

function editMenuItem(itemId) {
    const menuItems = getMenuItems();
    const item = menuItems.find(menuItem => menuItem.id === itemId);
    
    if (!item) return;
    
    const newName = prompt('Enter new name:', item.name);
    if (newName === null) return;
    
    const newPrice = parseFloat(prompt('Enter new price:', item.price));
    if (isNaN(newPrice) || newPrice <= 0) {
        alert('Invalid price!');
        return;
    }
    
    const newImageUrl = prompt('Enter new image URL:', item.imageUrl);
    if (newImageUrl === null) return;
    
    const newCategory = prompt('Enter category (morning/lunch/dinner):', item.category || 'morning');
    if (newCategory === null) return;
    
    if (!['morning', 'lunch', 'dinner'].includes(newCategory.toLowerCase())) {
        alert('Invalid category! Must be morning, lunch, or dinner');
        return;
    }
    
    item.name = newName.trim();
    item.price = newPrice;
    item.imageUrl = newImageUrl.trim();
    item.category = newCategory.toLowerCase();
    
    saveMenuItems(menuItems);
    displayMenu(currentCategory);
    displayAdminMenu();
    showNotification('Item updated successfully!');
}

function deleteMenuItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }
    
    const menuItems = getMenuItems();
    const filteredItems = menuItems.filter(item => item.id !== itemId);
    
    saveMenuItems(filteredItems);
    displayMenu(currentCategory);
    displayAdminMenu();
    showNotification('Item deleted successfully!');
}

// Monthly Sales Report
function generateSalesReport() {
    const salesHistory = JSON.parse(localStorage.getItem('salesHistory') || '[]');
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Filter sales for current month
    const monthlySales = salesHistory.filter(sale => {
        const saleDate = new Date(sale.timestamp);
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });
    
    const salesReportDiv = document.getElementById('salesReport');
    
    if (monthlySales.length === 0) {
        salesReportDiv.innerHTML = '<p class="no-sales">No sales recorded for this month.</p>';
    } else {
        let totalSales = 0;
        let totalOrders = monthlySales.length;
        
        monthlySales.forEach(sale => {
            totalSales += sale.total;
        });
        
        const averageOrder = totalSales / totalOrders;
        
        salesReportDiv.innerHTML = `
            <div class="sales-summary">
                <div class="sales-card">
                    <h3>Total Sales</h3>
                    <p>₹${totalSales.toFixed(2)}</p>
                </div>
                <div class="sales-card">
                    <h3>Total Orders</h3>
                    <p>${totalOrders}</p>
                </div>
                <div class="sales-card">
                    <h3>Average Order</h3>
                    <p>₹${averageOrder.toFixed(2)}</p>
                </div>
            </div>
            <table class="sales-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Date & Time</th>
                        <th>Items</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${monthlySales.map(sale => `
                        <tr>
                            <td>${sale.orderId}</td>
                            <td>${sale.date}</td>
                            <td>${sale.items.map(item => `${item.name} (${item.quantity})`).join(', ')}</td>
                            <td>₹${sale.total.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    document.getElementById('salesModal').style.display = 'block';
}

// Event Listeners Setup
function setupEventListeners() {
    // Admin toggle
    document.getElementById('adminToggle').addEventListener('click', toggleAdminMode);
    
    // Login button
    document.getElementById('loginBtn').addEventListener('click', loginAdmin);
    
    // Add item form
    document.getElementById('addItemForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addMenuItem();
    });
    
    // Pay now button
    document.getElementById('payNowBtn').addEventListener('click', generateQRCode);
    
    // Print bill button
    document.getElementById('printBillBtn').addEventListener('click', printBill);
    
    // Clear cart button
    document.getElementById('clearCartBtn').addEventListener('click', clearCart);
    
    // Sales report button
    document.getElementById('salesReportBtn').addEventListener('click', generateSalesReport);
    
    // Close modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close QR modal button
    document.getElementById('closeQRBtn').addEventListener('click', function() {
        document.getElementById('qrModal').style.display = 'none';
    });
    
    // Close modal on outside click
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Category filter buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Get category and update display
            currentCategory = this.getAttribute('data-category');
            displayMenu(currentCategory);
        });
    });
}

// Notification function
function showNotification(message) {
    // Simple notification (can be enhanced with a toast library)
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 2000;
        animation: slideIn 0.3s;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

