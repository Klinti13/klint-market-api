import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// 1. POST për 1 produkt
router.post('/', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(500).json({ message: "❌ Gabim gjatë ruajtjes", error: error.message });
    }
});

// 2. GET për të gjitha produktet
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "❌ Gabim gjatë leximit", error: error.message });
    }
});

// 3. POST për SEED (Shumë produkte)
router.post('/seed', async (req, res) => {
    try {
        const savedProducts = await Product.insertMany(req.body);
        res.status(201).json({ message: "Produktet u shtuan me sukses!", count: savedProducts.length });
    } catch (error) {
        res.status(500).json({ message: "❌ Gabim gjatë seeding", error: error.message });
    }
});

export default router; // <-- Ky rresht duhet të jetë FIKS në fund fare