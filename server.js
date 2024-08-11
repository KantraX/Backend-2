const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Server } = require('socket.io');
const handlebars = require('express-handlebars');
const productManager = require('./managers/productManager');
const cartManager = require('./managers/cartManager');

const app = express();
const PORT = 8080;

app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());

app.get('/realtimeproducts', (req, res) => {
    const products = productManager.getAllProducts();
    res.render('realTimeProducts', { products });
});


app.get('/realtimecart', (req, res) => {
    const cart = cartManager.getCartById(1);
    res.render('realTimeCart', { cart });
});


const server = app.listen(PORT, () => {
    console.log(`Servidor cargado en http://localhost:${PORT}`);
});

const io = new Server(server);

productManager.setIoInstance(io);
cartManager.setIoInstance(io);

io.on('connection', (socket) => {
    console.log('Conectado correctamente con ID:', socket.id);

    socket.emit('updateCart', cartManager.getCartById(1));

    socket.on('newProduct', (productData) => {
        const newProduct = productManager.addProduct(productData);
        console.log('Producto agregado:', newProduct);
        io.emit('updateProducts', productManager.getAllProducts());
    });

    socket.on('deleteProduct', (productId) => {
        productManager.deleteProduct(parseInt(productId, 10));
        console.log('Producto eliminado. ID:', productId);
        io.emit('updateProducts', productManager.getAllProducts());
    });

    socket.on('addProductToCart', ({ cartId, productId, quantity }) => {
        const updatedCart = cartManager.addProductToCart(cartId, parseInt(productId), parseInt(quantity));
        console.log(`Producto ID ${productId} agregado al carrito ID ${cartId}`);
        io.emit('updateCart', updatedCart);
    });

    socket.on('removeProductFromCart', ({ cartId, productId }) => {
        const updatedCart = cartManager.removeProductFromCart(cartId, parseInt(productId));
        console.log(`Producto ID ${productId} eliminado del carrito ID ${cartId}`);
        io.emit('updateCart', updatedCart);
    });

    socket.on('clearCart', ({ cartId }) => {
        const updatedCart = cartManager.clearCart(cartId);
        console.log(`Carrito ID ${cartId} vaciado.`);
        io.emit('updateCart', updatedCart);
    });
});