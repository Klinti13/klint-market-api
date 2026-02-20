import express from 'express';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. POST - Krijo produkt (Vetëm Admini)
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

// 2. GET - Merr të gjitha produktet (Për të gjithë)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "❌ Gabim gjatë leximit", error: error.message });
    }
});

// 3. DELETE - Fshi një produkt (VETËM ADMINI - Kjo mungonte!)
// @route   DELETE /api/products/:id
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await product.deleteOne(); // Fshin produktin nga MongoDB
            res.json({ message: 'Produkti u fshi me sukses 🗑️' });
        } else {
            res.status(404).json({ message: 'Produkti nuk u gjet' });
        }
    } catch (error) {
        res.status(500).json({ message: "❌ Gabim gjatë fshirjes", error: error.message });
    }
});

// 4. POST - Seed (Bulk add)
router.post('/seed', protect, admin, async (req, res) => {
    try {
        const savedProducts = await Product.insertMany(req.body);
        res.status(201).json({ message: "Produktet u shtuan me sukses!", count: savedProducts.length });
    } catch (error) {
        res.status(500).json({ message: "❌ Gabim gjatë seeding", error: error.message });
    }
});

export default router;