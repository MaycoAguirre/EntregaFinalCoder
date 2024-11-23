const mongoose = require('mongoose');

// Esquema para los productos
const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    code: String,
    price: Number,
    stock: Number,
    category: String,
    thumbnails: [String],
    status: Boolean
});

// Modelo de producto
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
