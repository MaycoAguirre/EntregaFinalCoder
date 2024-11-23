const express = require('express');
const { engine } = require('express-handlebars'); // Importar el motor de plantillas
const socketIo = require('socket.io');
const http = require('http');
const mongoose = require('mongoose');
const Product = require('./models/product.model.js');
const Cart = require('./models/cart.model.js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/entregaFinalTienda', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.log('Error al conectar a MongoDB', err));

// Configuración de Handlebars
app.engine('handlebars', engine({
  layoutsDir: __dirname + '/views/layouts',
  defaultLayout: 'main',
  allowProtoPropertiesByDefault: true // Asegúrate de que esta opción esté aquí
}));

// Middleware para manejar datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta para obtener los productos
app.get('/products', async (req, res) => {
  try {
      const products = await Product.find();  // Asegúrate de que Product está correctamente definido
      res.status(200).json(products);  // Devuelve los productos como respuesta
  } catch (error) {
      console.error("Error al obtener productos:", error);
      res.status(500).json({ message: 'Error al obtener productos' });
  }
});


// Ruta para productos en tiempo real
app.get('/realtimeproducts', async (req, res) => {
    try {
        const productos = await Product.find(); // Obtener productos desde MongoDB
        res.render('realtimeproducts', { title: 'Productos en Tiempo Real', products: productos });
    } catch (err) {
        res.status(500).send('Error al obtener productos');
    }
});

// Ruta para agregar un nuevo producto (POST)
app.post('/products', async (req, res) => {
    try {
        const { title, description, code, price, stock, category, thumbnails, status } = req.body;

        // Crear un nuevo producto
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

        // Guardar el producto en la base de datos
        await newProduct.save();

        // Responder con el producto agregado
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ message: 'Error al agregar el producto', error: err });
    }
});

// Configuración de WebSocket
io.on('connection', (socket) => {
    console.log('Cliente conectado');

    // Emitir la lista de productos a los clientes conectados
    Product.find().then(products => {
        socket.emit('productUpdate', products);
    });

    // Lógica para agregar productos
    socket.on('addProduct', async (productData) => {
        try {
            const newProduct = new Product(productData);
            await newProduct.save();
            io.emit('productUpdate', await Product.find()); // Emitir la actualización a todos los clientes
        } catch (err) {
            console.error('Error al agregar producto:', err);
        }
    });

    // Lógica para eliminar productos
    socket.on('removeProduct', async (id) => {
        try {
            await Product.findByIdAndDelete(id);
            io.emit('productUpdate', await Product.find()); // Emitir la actualización a todos los clientes
        } catch (err) {
            console.error('Error al eliminar producto:', err);
        }
    });
});

// Levanta el servidor
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
