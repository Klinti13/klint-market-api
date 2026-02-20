import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Krijo porosi të re
// @route   POST /api/orders
// @access  Private (Klienti)
router.post('/', protect, async (req, res) => {
    try {
        // SHTUAM: useVipPoints vjen nga Frontend-i
        const { orderItems, shippingAddress, totalPrice, useVipPoints } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'Shporta është bosh' });
        }

        // SIGURIA: Marrim të dhënat e sakta të userit nga Databaza
        const currentUser = await User.findById(req.user._id);
        
        let deductedPoints = 0;
        // Nëse Frontendi thotë "Dua ulje VIP" dhe përdoruesi i ka vërtet 1000 pikë
        if (useVipPoints && currentUser.points >= 1000) {
            deductedPoints = 1000;
        }

        const order = new Order({
            user: req.user._id,
            orderItems,
            shippingAddress,
            totalPrice,
            paymentMethod: 'Cash on Delivery'
        });

        const createdOrder = await order.save();

        const pointsEarned = Math.floor(totalPrice / 100);
        
        // PËRDITËSIMI MATEMATIK I PIKËVE
        // Shtojmë pikët e reja nga blerja, dhe heqim ato 1000 (nëse e ka përdorur VIP-in)
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id, 
            { $inc: { points: pointsEarned - deductedPoints } },
            { new: true }
        );

        res.status(201).json({ 
            order: createdOrder, 
            points: updatedUser.points 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Merr porositë e mia
// @route   GET /api/orders/myorders
// @access  Private (Klienti)
router.get('/myorders', protect, async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
});

// --- RRUGËT PËR ADMIN ---

// @desc    Merr të gjitha porositë
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Përditëso statusin e porosisë
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
    try {
        console.log("Duke përditësuar porosinë ID:", req.params.id);
        console.log("Statusi i ri:", req.body.status);

        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = req.body.status || order.status;
            
            if (order.status === 'Porosia u dërgua') {
                order.isPaid = true;
                order.paidAt = Date.now(); 
            }

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            console.log("❌ Porosia nuk u gjet në Databazë!");
            res.status(404).json({ message: 'Porosia nuk u gjet' });
        }
    } catch (error) {
        console.error("❌ Error te Status Update:", error.message);
        res.status(500).json({ message: "Gabim i brendshëm i serverit: " + error.message });
    }
});

// @desc    Fshi një porosi
// @route   DELETE /api/orders/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            await order.deleteOne(); 
            res.json({ message: 'Porosia u fshi me sukses 🗑️' });
        } else {
            res.status(404).json({ message: 'Porosia nuk u gjet' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;