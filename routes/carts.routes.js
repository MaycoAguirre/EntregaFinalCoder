const express = require('express');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const router = express.Router();

// Crear un nuevo carrito
router.post('/', async (req, res) => {
  try {
    const newCart = new Cart();
    await newCart.save();
    res.status(201).json(newCart);
  } catch (err) {
    res.status(500).send('Error al crear el carrito');
  }
});

// Obtener los productos de un carrito
router.get('/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product');
    if (!cart) {
      return res.status(404).send('Carrito no encontrado');
    }
    res.json(cart.products);
  } catch (err) {
    res.status(500).send('Error al obtener el carrito');
  }
});

// Agregar un producto a un carrito
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    const product = await Product.findById(req.params.pid);

    if (!cart || !product) {
      return res.status(404).send('Carrito o producto no encontrado');
    }

    const existingProduct = cart.products.find(p => p.product.toString() === req.params.pid);
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ product: req.params.pid, quantity: 1 });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).send('Error al agregar producto al carrito');
  }
});

module.exports = router;
