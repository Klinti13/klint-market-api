import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. REGJISTRIMI
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "❌ Ky email është i regjistruar tashmë!" });
        }
        const user = await User.create({ name, email, password });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                points: user.points || 0, // KËTU E SHTUAM MAGJINË
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: "❌ Të dhënat e përdoruesit nuk janë të sakta" });
        }
    } catch (error) {
        res.status(500).json({ message: "Gabim në server", error: error.message });
    }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                points: user.points || 0, // KËTU E SHTUAM MAGJINË PËRSËRI
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: "❌ Email ose fjalëkalim i gabuar!" });
        }
    } catch (error) {
        res.status(500).json({ message: "Gabim në server", error: error.message });
    }
});

export default router;