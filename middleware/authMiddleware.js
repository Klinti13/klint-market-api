import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 1. KONTROLLON VETËM NËSE ËSHTË I LOGUAR (Për Profilin, Shportën, etj.)
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      return next(); // Përdor 'return' që kodi të ndalojë këtu
    } catch (error) {
      return res.status(401).json({ message: '❌ Autorizim i dështuar, token i pasaktë' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: '❌ Nuk ka token, autorizimi u mohua' });
  }
};

// 2. KONTROLLON VETËM NËSE ËSHTË ADMIN (Për Admin Dashboard)
export const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401).json({ message: '❌ Ky seksion kërkon qasje Admini' });
    }
};