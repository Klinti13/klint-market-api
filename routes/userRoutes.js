import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/authMiddleware.js'; 

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
                points: user.points,
                address: user.address,
                city: user.city,
                phone: user.phone,
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
                points: user.points,
                address: user.address, 
                city: user.city,
                phone: user.phone,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: "❌ Email ose fjalëkalim i gabuar!" });
        }
    } catch (error) {
        res.status(500).json({ message: "Gabim në server", error: error.message });
    }
});

// 3. PËRDITËSO PROFILIN (Për të ruajtur adresën e re)
router.put('/profile', protect, async (req, res) => {
    console.log("--> Kërkesë për përditësim Profili e marrë për User ID:", req.user._id);
    console.log("--> Të dhënat e ardhura:", req.body);
    
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.address = req.body.address || user.address;
            user.city = req.body.city || user.city;
            user.phone = req.body.phone || user.phone;
            
            if (req.body.name) user.name = req.body.name;
            if (req.body.password) user.password = req.body.password;

            const updatedUser = await user.save();
            console.log("--> Përditësimi u krye me sukses!");

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                points: updatedUser.points,
                address: updatedUser.address, 
                city: updatedUser.city,
                phone: updatedUser.phone,
                token: generateToken(updatedUser._id) 
            });
        } else {
            console.log("--> Përdoruesi nuk u gjet në DB.");
            res.status(404).json({ message: "❌ Përdoruesi nuk u gjet" });
        }
    } catch (error) {
        console.error("--> Gabim Serveri:", error.message);
        res.status(500).json({ message: "Gabim në server", error: error.message });
    }
});

export default router;