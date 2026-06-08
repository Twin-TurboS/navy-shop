const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/products.json');

// Получить все товары
router.get('/', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Ошибка сервера');
        res.json(JSON.parse(data));
    });
});

// Добавить новый товар
router.post('/', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Ошибка сервера');
        const products = JSON.parse(data);
        const newProduct = {
            id: Date.now(),
            name: req.body.name,
            category: req.body.category,
            price: Number(req.body.price),
            image: req.body.image || 'https://via.placeholder.com/150',
            description: req.body.description
        };
        products.push(newProduct);
        fs.writeFile(dbPath, JSON.stringify(products, null, 2), (err) => {
            if (err) return res.status(500).send('Ошибка записи');
            res.status(201).json(newProduct);
        });
    });
});

module.exports = router;