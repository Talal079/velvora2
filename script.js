const products = [
    {id:1, name:"تيشيرت 1", sizes:["S","M","L"], image:"images/tshirt1.jpg"},
    {id:2, name:"تيشيرت 2", sizes:["M","L"], image:"images/tshirt2.jpg"},
    {id:3, name:"تيشيرت 3", sizes:["S","M"], image:"images/tshirt3.jpg"},
    {id:4, name:"تيشيرت 4", sizes:["M","L"], image:"images/tshirt4.jpg"},
    {id:5, name:"تيشيرت 5", sizes:["S","M","L"], image:"images/tshirt5.jpg"},
    {id:6, name:"تيشيرت 6", sizes:["M","L"], image:"images/tshirt6.jpg"},
    {id:7, name:"تيشيرت 7", sizes:["S","M"], image:"images/tshirt7.jpg"},
    {id:8, name:"تيشيرت 8", sizes:["M","L"], image:"images/tshirt8.jpg"},
    {id:9, name:"تيشيرت 9", sizes:["S","M"], image:"images/tshirt9.jpg"},
    {id:10, name:"تيشرت 10", sizes:["S","M","L"], image:"images/tshirt10.jpg"},
];
const WHATSAPP_NUMBER = "218945751372"; // الرقم الجديد والمحدث
const UNIT_PRICE = 80;

// ===================================
// 1. وظائف سلة المشتريات (Cart Functions)
// ===================================

function getCart() {
    // استرجاع السلة من الذاكرة المحلية (localStorage)
    const cart = localStorage.getItem('shoppingCart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        countElement.textContent = count;
    }
}

function addToCart(productId, name) {
    const sizeSelect = document.getElementById(`size-${productId}`);
    const quantityInput = document.getElementById(`qty-${productId}`);

    const selectedSize = sizeSelect.value;
    const quantity = parseInt(quantityInput.value);

    if (!selectedSize) {
        alert('الرجاء تحديد المقاس أولاً لإضافة المنتج للسلة.');
        return;
    }
    if (quantity < 1 || isNaN(quantity)) {
        alert('الرجاء تحديد كمية صحيحة (1 أو أكثر).');
        return;
    }

    const cart = getCart();
    // البحث عن المنتج بنفس المقاس (لتجميع الكميات)
    const existingItemIndex = cart.findIndex(item => item.id === productId && item.size === selectedSize);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: name,
            size: selectedSize,
            quantity: quantity,
            price: UNIT_PRICE 
        });
    }

    saveCart(cart);
    alert(`${quantity} قطعة من ${name} مقاس ${selectedSize} أضيفت إلى السلة!`);
}

function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    displayCart(); // إعادة عرض السلة بعد الحذف
}


// ===================================
// 2. وظائف عرض المنتجات والسلة
// ===================================

// عرض منتجات الصفحة الرئيسية
function displayProducts(filtered = null) {
    const container = document.getElementById('product-container');
    if (!container) return; 
    container.innerHTML = "";
    const list = filtered || products;
    
    list.forEach(p => {
        const card = document.createElement('div');
        card.className = "product-card";
        card.innerHTML = `
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p>السعر: ${UNIT_PRICE} دينار</p>
            
            <label for="size-${p.id}">المقاس:</label>
            <select id="size-${p.id}" required>
                <option value="">اختر مقاس</option>
                ${p.sizes.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
            
            <label for="qty-${p.id}">الكمية:</label>
            <input type="number" id="qty-${p.id}" value="1" min="1" required>
            
            <button onclick="addToCart(${p.id}, '${p.name}')">
                إضافة إلى السلة
            </button>
        `;
        container.appendChild(card);
    });
}

// عرض محتويات السلة (لصفحة cart.html)
function displayCart() {
    const container = document.getElementById('cart-items');
    const summary = document.getElementById('cart-summary');
    if (!container || !summary) return;

    const cart = getCart();
    container.innerHTML = "";
    let totalItems = 0;
    let totalPrice = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-message">سلة المشتريات فارغة.</p>';
        document.getElementById('total-items').textContent = '0';
        document.getElementById('total-price').textContent = '0';
        document.getElementById('checkout-button').disabled = true;
        return;
    }

    cart.forEach((item, index) => {
        const p = products.find(prod => prod.id === item.id) || {image: "images/placeholder.jpg"};
        const itemTotal = item.quantity * item.price;
        totalItems += item.quantity;
        totalPrice += itemTotal;

        const card = document.createElement('div');
        card.className = "product-card cart-item";
        card.innerHTML = `
            <img src="${p.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>المقاس: <strong>${item.size}</strong></p>
            <p>الكمية: <strong>${item.quantity}</strong></p>
            <p>السعر الإجمالي: ${itemTotal} دينار</p>
            <button class="remove-button" onclick="removeFromCart(${index})">حذف من السلة</button>
        `;
        container.appendChild(card);
    });
    
    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('total-price').textContent = totalPrice;
    document.getElementById('checkout-button').disabled = false;
}


// ===================================
// 3. وظائف البحث وإتمام الطلب
// ===================================

function searchProducts() {
    const query = document.getElementById('search').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(query));
    displayProducts(filtered);
}

// دالة إتمام الطلب عبر واتساب
function checkout() {
    const cart = getCart();
    if (cart.length === 0) {
        alert("سلة المشتريات فارغة. الرجاء إضافة منتجات أولاً.");
        return;
    }

    let message = "أهلاً، أود طلب المنتجات التالية:\n\n";
    let totalPrice = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.quantity * item.price;
        totalPrice += itemTotal;
        message += `${index + 1}. ${item.name} - مقاس ${item.size} - كمية ${item.quantity} - السعر: ${itemTotal} دينار.\n`;
    });

    message += `\nالإجمالي العام: ${totalPrice} دينار.`;
    message += `\n\nأرجو تزويدي بتفاصيل الدفع والشحن. شكراً!`;

    const encodedMessage = encodeURIComponent(message);
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, "_blank");
    
    // مسح السلة بعد إتمام الطلب بنجاح
    saveCart([]); 
    alert('تم إرسال طلبك عبر واتساب. سيتم مسح السلة الآن.');
    // التحديث إذا كنا على صفحة السلة
    if (document.getElementById('cart-items')) {
        displayCart(); 
    }
}


// تشغيل العرض وتحديث عداد السلة عند تحميل أي صفحة
document.addEventListener("DOMContentLoaded", () => {
    // عرض المنتجات فقط في الصفحة الرئيسية
    if (document.getElementById('product-container')) {
        displayProducts();
    }
    updateCartCount();
});