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
        const { orderItems, shippingAddress, totalPrice } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'Shporta është bosh' });
        }

        const order = new Order({
            user: req.user._id,
            orderItems,
            shippingAddress,
            totalPrice,
            paymentMethod: 'Cash on Delivery'
        });

        const createdOrder = await order.save();

        // Llogaritja e pikëve: 100 L = 1 pikë
        const pointsEarned = Math.floor(totalPrice / 100);
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id, 
            { $inc: { points: pointsEarned } },
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

// @desc    Përditëso statusin e porosisë (Pending -> Shipped -> Delivered)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = req.body.status || order.status;
            
            if (order.status === 'Delivered' || order.status === 'Paguar') {
                order.isPaid = true;
            }

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Porosia nuk u gjet' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Fshi një porosi
// @route   DELETE /api/orders/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            await order.deleteOne(); // Fshin porosinë nga databaza përfundimisht
            res.json({ message: 'Porosia u fshi me sukses 🗑️' });
        } else {
            res.status(404).json({ message: 'Porosia nuk u gjet' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;