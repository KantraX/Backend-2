const fs = require('fs');
const path = require('path');
const cartsFilePath = path.join(__dirname, '../carts.json');
const productManager = require('./productManager');

let carts = [];
let io;

function saveCarts() {
    fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2), 'utf8');
    console.log('Carritos guardados en carts.json');
}

function loadCarts() {
    try {
        const data = fs.readFileSync(cartsFilePath, 'utf8');
        carts = JSON.parse(data);
    } catch (error) {
        carts = [];
        console.error('Error al cargar carts.json:', error);
    }
}

function getCartById(cid) {
    loadCarts();
    const cart = carts.find(cart => cart.id === cid);
    if (!cart) {
        
        const newCart = { id: cid, products: [] };
        carts.push(newCart);
        saveCarts();
        return newCart;
    }
    return cart;
}

function addProductToCart(cid, pid, quantity) {
    const cart = getCartById(cid);
    const product = productManager.getProductById(pid);
    if (!product) {
        console.error('Producto no encontrado en la lista, por lo tanto, no puede ser agregado al carro');
        return null;
    }

    const productIndex = cart.products.findIndex(item => item.product === pid);
    if (productIndex !== -1) {
        cart.products[productIndex].quantity += quantity;
    } else {
        
        cart.products.push({ product: pid, name: product.name, price: product.price, quantity });
    }
    saveCarts();
    console.log('Producto agregado al carrito correctamente:', cart);
    return cart;
}

function removeProductFromCart(cid, pid) {
    const cart = getCartById(cid);
    cart.products = cart.products.filter(item => item.product !== pid);
    saveCarts();
    console.log('Producto eliminado del carrito:', cart);
    return cart;
}

function clearCart(cid) {
    const cart = getCartById(cid);
    if (cart) {
        cart.products = [];
        saveCarts();
        console.log(`Carrito con ID ${cid} ha sido vaciado correctamente.`);
        return cart;
    } else {
        console.error(`Carrito con ID ${cid} no encontrado.`);
        return null;
    }
}

function setIoInstance(socketIoInstance) {
    io = socketIoInstance;
}

module.exports = {
    getCartById,
    addProductToCart,
    removeProductFromCart,
    clearCart,
    saveCarts,
    setIoInstance
};