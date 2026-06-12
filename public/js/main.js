let cart = [];

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/products')
        .then(res => res.json())
        .then(products => renderCatalog(products));
});

// Рендер каталога
function renderCatalog(products) {
    const catalogDiv = document.getElementById('catalog');
    catalogDiv.innerHTML = '';
    products.forEach(product => {
        catalogDiv.innerHTML += `
            <div class="card">
                <div class="image-container" onclick="openLightbox('${product.image}')">
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

// Функции Лайтбокса (Просмотр картинок)
function openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = src;
    lightbox.classList.add('active');
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
}

// Добавление в корзину
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
    const totalCount = cart.reduce((sum, i) => sum + i.quantity, 0);
    document.getElementById('cart-count').innerText = totalCount;
    
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
        cartItems.innerHTML += `
            <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:14px; border-bottom: 1px solid #f5f5f7; padding-bottom: 8px;">
                <span>${item.name} (x${item.quantity})</span>
                <strong>${item.price * item.quantity} ₽</strong>
            </div>
        `;
    });
    document.getElementById('cart-total-price').innerText = total;
    document.getElementById('pay-sum').innerText = total;
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    if (modal.style.display === 'block') {
        nextStep(1); // Всегда сбрасываем на шаг 1 при открытии
    }
}

// Переключение шагов оформления заказа
function nextStep(stepNum) {
    document.querySelectorAll('.checkout-step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(`step-${stepNum}`).classList.add('active');
}

// Валидация контактов
function validateAndGoToPayment() {
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const email = document.getElementById('cust-email').value;

    if (!name || !phone || !email) {
        alert('Пожалуйста, заполните все поля!');
        return;
    }
    nextStep(3);
}

// Симуляция оплаты банка
function startPaymentProcess() {
    const card = document.getElementById('card-num').value;
    if (card.length < 16) {
        alert('Введите корректный номер карты!');
        return;
    }

    nextStep(4); // Переходим на экран загрузки
    document.getElementById('loading-state').style.display = 'block';
    document.getElementById('success-state').style.display = 'none';

    // Симулируем задержку банка (2.5 секунды процессинга)
    setTimeout(() => {
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('success-state').style.display = 'block';
        document.getElementById('order-id').innerText = 'ВМФ-' + Math.floor(100000 + Math.random() * 900000);
    }, 2500);
}

// Закрытие корзины и сброс
function closeAndResetCart() {
    cart = [];
    updateCart();
    toggleCart();
    // Очищаем поля формы
    document.getElementById('cust-name').value = '';
    document.getElementById('cust-phone').value = '';
    document.getElementById('cust-email').value = '';
    document.getElementById('card-num').value = '';
}