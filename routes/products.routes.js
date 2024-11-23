const express = require('express');
const router = express.Router();
const Product = require('../models/product.model');

// Ruta para obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ruta para agregar un producto
router.post('/', async (req, res) => {
    const { title, description, code, price, stock, category, thumbnails, status } = req.body;

    const newProduct = new Product({
        title,
        description,
        code,
        price,
        stock,
        category,
        thumbnails,
        status
    });

    try {
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
