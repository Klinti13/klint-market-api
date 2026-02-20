import express from 'express';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. POST për 1 produkt nga Admini
router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, price, oldPrice, description, image, category, badge } = req.body;
        const newProduct = new Product({
            name,
            price,
            oldPrice: oldPrice || null,
            description: description || 'Produkte cilësore nga KLINT.',
            imageUrl: image,
            category: category || 'Veshje',
            badge: badge || ''
        });
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(500).json({ message: "❌ Gabim gjatë ruajtjes", error: error.message });
    }
});

// 2. GET për të gjitha produktet
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "❌ Gabim gjatë leximit", error: error.message });
    }
});

// 3. DELETE produktin (E RE)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne();
            res.json({ message: 'Produkti u fshi me sukses 🗑️' });
        } else {
            res.status(404).json({ message: 'Produkti nuk u gjet' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. POST për SEED
router.post('/seed', protect, admin, async (req, res) => {
    try {
        const savedProducts = await Product.insertMany(req.body);
        res.status(201).json({ message: "Produktet u shtuan me sukses!", count: savedProducts.length });
    } catch (error) {
        res.status(500).json({ message: "❌ Gabim gjatë seeding", error: error.message });
    }
});

export default router;