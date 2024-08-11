const fs = require('fs');
const path = require('path');
const productsFilePath = path.join(__dirname, '../products.json');

let products = [];
let io;

function saveProducts() {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf8');
    console.log('Productos guardados en products.json');
}

function loadProducts() {
    try {
        const data = fs.readFileSync(productsFilePath, 'utf8');
        products = JSON.parse(data);
    } catch (error) {
        products = [];
    }
}

function getAllProducts() {
    loadProducts();
    return products;
}

function getProductById(pid) {
    loadProducts();
    return products.find(product => product.id === pid);
}

function addProduct(productData) {
    loadProducts();
    const newProduct = {
        id: generateProductId(),
        ...productData,
        price: parseFloat(productData.price)
    };
    products.push(newProduct);
    saveProducts();
    if (io) io.emit('updateProducts', products);
    return newProduct;
}

function deleteProduct(pid) {
    loadProducts();
    const initialLength = products.length;
    products = products.filter(product => product.id !== pid);
    if (products.length !== initialLength) {
        saveProducts();
        if (io) io.emit('updateProducts', products);
        return products;
    }
    return null;
}

function generateProductId() {
    return products.length > 0 ? products[products.length - 1].id + 1 : 1;
}

function setIoInstance(socketIoInstance) {
    io = socketIoInstance;
}

module.exports = {
    getAllProducts,
    getProductById,
    addProduct,
    deleteProduct,
    setIoInstance
};