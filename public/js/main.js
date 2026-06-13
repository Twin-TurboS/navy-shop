let cart = [];
let discountPercent = 0; // Процент скидки по промокоду

// Начальные отзывы, если в памяти еще ничего нет
const defaultReviews = [
    { author: "Капитан 1-го ранга Смирнов", rating: 5, text: "Тельняшка двойной вязки прошла испытание Баренцевым морем. Теплая, не садится после стирки. Рекомендую всему экипажу!" },
    { author: "Старшина 2-й статьи Петренко", rating: 5, text: "Бескозырка сидит как влитая. Золотое тиснение на ленте качественное, не тускнеет от соленой воды. Спасибо за быструю доставку в Севастополь." }
];

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/products')
        .then(res => res.json())
        .then(products => renderCatalog(products));
    
    renderReviews();
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

// Функции Лайтбокса
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
    
    showToast(`⚓ ${name} добавлен в корзину!`);
    
    const cartBtn = document.getElementById('cart-btn');
    cartBtn.classList.add('bounce');
    setTimeout(() => {
        cartBtn.classList.remove('bounce');
    }, 400);
}

// Показ уведомления
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}

// Изменение количества
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

// Удаление из корзины
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
    
    let originalTotal = 0;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `<div style="text-align:center; color:#94a3b8; padding: 20px 0;">Ваша корзина пуста</div>`;
        document.getElementById('checkout-next-btn').style.display = 'none';
    } else {
        document.getElementById('checkout-next-btn').style.display = 'block';
        cart.forEach(item => {
            originalTotal += item.price * item.quantity;
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
                        <button class="delete-btn" onclick="removeFromCart(${item.id})">&times;</button>
                    </div>
                </div>
            `;
        });
    }
    
    // Расчет скидки
    let finalTotal = originalTotal;
    const oldPriceSpan = document.getElementById('old-price');
    
    if (discountPercent > 0 && originalTotal > 0) {
        finalTotal = Math.round(originalTotal * (1 - discountPercent / 100));
        oldPriceSpan.innerText = `${originalTotal} ₽`;
        oldPriceSpan.style.display = 'inline';
    } else {
        oldPriceSpan.style.display = 'none';
    }
    
    document.getElementById('cart-total-price').innerText = finalTotal;
    document.getElementById('pay-sum').innerText = finalTotal;
}

// Применение промокода
function applyPromo() {
    const code = document.getElementById('promo-input').value.trim().toUpperCase();
    const msg = document.getElementById('promo-message');
    
    if (code === 'PETR1') {
        discountPercent = 10;
        msg.innerText = 'Промокод PETR1 применен! Скидка 10%';
        msg.style.color = '#10b981';
        showToast('Активирована скидка 10%!');
    } else if (code === 'ILARIAmylove') {
        discountPercent = 20;
        msg.innerText = 'Промокод ADMIRAL применен! Скидка 20%';
        msg.style.color = '#10b981';
        showToast('Активирована скидка 20%!');
    } else {
        discountPercent = 0;
        msg.innerText = 'Неверный промокод';
        msg.style.color = '#ef4444';
    }
    updateCart();
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    if (modal.style.display === 'block') {
        nextStep(1);
    }
}

function nextStep(stepNum) {
    document.querySelectorAll('.checkout-step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(`step-${stepNum}`).classList.add('active');
}

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
        const generatedId = 'ВМФ-' + Math.floor(100000 + Math.random() * 900000);
        document.getElementById('order-id').innerText = generatedId;
    }, 2500);
}

function copyOrderId() {
    const orderId = document.getElementById('order-id').innerText;
    navigator.clipboard.writeText(orderId).then(() => {
        showToast('Номер заказа скопирован!');
    });
}

function closeAndResetCart() {
    cart = [];
    discountPercent = 0;
    document.getElementById('promo-input').value = '';
    document.getElementById('promo-message').innerText = '';
    updateCart();
    toggleCart();
    document.getElementById('cust-name').value = '';
    document.getElementById('cust-phone').value = '';
    document.getElementById('cust-email').value = '';
    document.getElementById('card-num').value = '';
}

// --- ОТСЛЕЖИВАНИЕ ЗАКАЗА (ТРЕКЕР) ---
function trackOrder() {
    const input = document.getElementById('tracker-id-input').value.trim();
    const visual = document.getElementById('tracker-visual');
    const statusTitle = document.getElementById('tracker-status-title');
    const progress = document.getElementById('track-progress');
    const ship = document.getElementById('track-ship');
    
    const pMiddle = document.getElementById('point-middle');
    const pEnd = document.getElementById('point-end');

    if (!input.startsWith('ВМФ-') || input.length < 8) {
        alert('Пожалуйста, введите корректный номер заказа в формате ВМФ-XXXXXX');
        return;
    }

    visual.style.display = 'block';
    
    // Получаем число из номера заказа, чтобы статус зависел от номера
    const orderNum = parseInt(input.replace('ВМФ-', '')) || 123456;
    const phase = orderNum % 3; // 0, 1 или 2

    // Сбрасываем классы точек
    pMiddle.classList.remove('active');
    pEnd.classList.remove('active');

    if (phase === 0) {
        statusTitle.innerText = "Статус: Заказ собирается в порту Санкт-Петербурга ⚓";
        progress.style.width = "0%";
        ship.style.left = "0%";
    } else if (phase === 1) {
        statusTitle.innerText = "Статус: Корабль идет по курсу, преодолевая шторм 🌊🚢";
        progress.style.width = "50%";
        ship.style.left = "50%";
        pMiddle.classList.add('active');
    } else {
        statusTitle.innerText = "Статус: Груз успешно прибыл в ваш порт! Ожидайте SMS 📦🎉";
        progress.style.width = "100%";
        ship.style.left = "100%";
        pMiddle.classList.add('active');
        pEnd.classList.add('active');
    }
    
    showToast('Курс корабля рассчитан!');
}

// --- ОТЗЫВЫ (REVIEWS) ---
function getReviews() {
    const stored = localStorage.getItem('vmf_reviews');
    if (stored) {
        return JSON.parse(stored);
    }
    return defaultReviews;
}

function renderReviews() {
    const container = document.getElementById('reviews-container');
    container.innerHTML = '';
    const reviews = getReviews();
    
    reviews.forEach(r => {
        let stars = '⭐'.repeat(r.rating);
        container.innerHTML += `
            <div class="review-card">
                <div class="review-header">
                    <strong>${r.author}</strong>
                    <span class="review-stars">${stars}</span>
                </div>
                <p class="review-text">"${r.text}"</p>
            </div>
        `;
    });
}

function submitReview() {
    const author = document.getElementById('review-author').value.trim();
    const rating = parseInt(document.getElementById('review-rating').value);
    const text = document.getElementById('review-text').value.trim();

    if (!author || !text) {
        alert('Пожалуйста, заполните все поля рапорта!');
        return;
    }

    const reviews = getReviews();
    reviews.unshift({ author, rating, text }); // Добавляем новый отзыв в начало
    localStorage.setItem('vmf_reviews', JSON.stringify(reviews));
    
    renderReviews();
    
    // Очищаем форму
    document.getElementById('review-author').value = '';
    document.getElementById('review-text').value = '';
    
    showToast('Рапорт успешно доставлен в штаб!');
}

// Политика конфиденциальности
function openPolicyModal() { document.getElementById('policy-modal').style.display = 'block'; }
function closePolicyModal() { document.getElementById('policy-modal').style.display = 'none'; }
function closePolicyModalOutside(e) { if (e.target.id === 'policy-modal') closePolicyModal(); }