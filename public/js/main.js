let cart = [];

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/products')
        .then(res => res.json())
        .then(products => renderCatalog(products));
});

function renderCatalog(products) {
    const catalogDiv = document.getElementById('catalog');
    catalogDiv.innerHTML = '';
    products.forEach(product => {
        catalogDiv.innerHTML += `
            <div class="card">
                <div class="image-container">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="card-content">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="price">${product.price} ₽</div>
                    <button class="btn" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">В корзину</button>
                </div>
            </div>
        `;
    });
}

function addToCart(id, name, price) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity++;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    updateCart();
}

function updateCart() {
    document.getElementById('cart-count').innerText = cart.reduce((sum, i) => sum + i.quantity, 0);
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
        cartItems.innerHTML += `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:14px;">
                <span>${item.name} (x${item.quantity})</span>
                <strong>${item.price * item.quantity} ₽</strong>
            </div>
        `;
    });
    document.getElementById('cart-total-price').innerText = total;
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function checkout() {
    if(cart.length === 0) return alert('Корзина пуста!');
    alert('Заказ успешно оформлен! С вами свяжется дежурный по связи.');
    cart = [];
    updateCart();
    toggleCart();
}