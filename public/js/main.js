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
    
    // Эффект добавления: всплывающее уведомление
    showToast(`⚓ ${name} добавлен в корзину!`);
    
    // Анимация прыжка иконки корзины
    const cartBtn = document.getElementById('cart-btn');
    cartBtn.classList.add('bounce');
    setTimeout(() => {
        cartBtn.classList.remove('bounce');
    }, 400);
}

// Показ всплывающего уведомления (Toast)
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    
    container.appendChild(toast);
    
    // Удаляем уведомление из DOM после окончания анимации (3 секунды)
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Изменение количества товара в корзине
function changeQuantity(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(id);
            return;
        }
    }
    updateCart();
}

// Полное удаление товара из корзины
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
    showToast('Товар удален из корзины');
}

// Обновление корзины
function updateCart() {
    const totalCount = cart.reduce((sum, i) => sum + i.quantity, 0);
    document.getElementById('cart-count').innerText = totalCount;
    
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    
    let total = 0;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `<div style="text-align:center; color:#94a3b8; padding: 20px 0;">Ваша корзина пуста</div>`;
        document.getElementById('checkout-next-btn').style.display = 'none';
    } else {
        document.getElementById('checkout-next-btn').style.display = 'block';
        cart.forEach(item => {
            total += item.price * item.quantity;
            cartItems.innerHTML += `
                <div class="cart-item-row">
                    <div class="cart-item-info">
                        <span class="cart-item-name">${item.name}</span>
                        <span class="cart-item-price">${item.price * item.quantity} ₽</span>
                    </div>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)">-</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
                        <button class="delete-btn" onclick="removeFromCart(${item.id})" title="Удалить">
                            &times;
                        </button>
                    </div>
                </div>
            `;
        });
    }
    
    document.getElementById('cart-total-price').innerText = total;
    document.getElementById('pay-sum').innerText = total;
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    if (modal.style.display === 'block') {
        nextStep(1);
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

    nextStep(4);
    document.getElementById('loading-state').style.display = 'block';
    document.getElementById('success-state').style.display = 'none';

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
    document.getElementById('cust-name').value = '';
    document.getElementById('cust-phone').value = '';
    document.getElementById('cust-email').value = '';
    document.getElementById('card-num').value = '';
}

// Политика конфиденциальности
function openPolicyModal() {
    document.getElementById('policy-modal').style.display = 'block';
}

function closePolicyModal() {
    document.getElementById('policy-modal').style.display = 'none';
}

function closePolicyModalOutside(event) {
    if (event.target.id === 'policy-modal') {
        closePolicyModal();
    }
}