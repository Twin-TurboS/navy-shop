const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Мидлвары
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Подключение модулей маршрутизации (API)
app.use('/api/products', productRoutes);

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});