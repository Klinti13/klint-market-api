import express from 'express';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. POST - Krijo produkt
router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, price, oldPrice, description, image, category, badge } = req.body;
        const newProduct = new Product({
            name, price, oldPrice: oldPrice || null,
            description: description || 'Produkte cilësore nga KLINT.',
            imageUrl: image, category: category || 'Veshje', badge: badge || '',
            isActive: true
        });
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) { res.status(500).json({ message: "❌ Gabim", error: error.message }); }
});

// 2. GET - Merr të gjitha produktet
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) { res.status(500).json({ message: "❌ Gabim", error: error.message }); }
});

// 3. DELETE - Fshi produktin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne(); 
            res.json({ message: 'Produkti u fshi me sukses 🗑️' });
        } else { res.status(404).json({ message: 'Produkti nuk u gjet' }); }
    } catch (error) { res.status(500).json({ message: "❌ Gabim", error: error.message }); }
});

// 4. POST - Seed
router.post('/seed', protect, admin, async (req, res) => {
    try {
        const savedProducts = await Product.insertMany(req.body);
        res.status(201).json({ message: "U shtuan me sukses!", count: savedProducts.length });
    } catch (error) { res.status(500).json({ message: "❌ Gabim", error: error.message }); }
});

// 5. PUT - MODIFIKO PRODUKTIN (SHTUAR TANI ✏️)
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.name = req.body.name || product.name;
            product.price = req.body.price !== undefined ? req.body.price : product.price;
            product.oldPrice = req.body.oldPrice !== undefined ? req.body.oldPrice : product.oldPrice;
            product.description = req.body.description || product.description;
            // Sigurohemi që merr 'image' ose 'imageUrl' nga Frontendi
            product.imageUrl = req.body.image || req.body.imageUrl || product.imageUrl; 
            product.category = req.body.category || product.category;
            product.badge = req.body.badge !== undefined ? req.body.badge : product.badge;
            product.isActive = req.body.isActive !== undefined ? req.body.isActive : product.isActive;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Produkti nuk u gjet' });
        }
    } catch (error) { res.status(500).json({ message: "❌ Gabim gjatë modifikimit", error: error.message }); }
});

export default router;