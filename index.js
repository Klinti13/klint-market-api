import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import productRoutes from './routes/productRoutes.js'; // <-- SHTUAM KËTË
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);


if (!process.env.MONGO_URI) {
    console.error('❌ Kujdes: MONGO_URI nuk u gjet!');
} else {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('✅ U lidhëm me sukses me MongoDB Atlas!'))
        .catch((err) => console.error('❌ Gabim:', err.message));
}

// <-- SHTUAM KËTË: Çdo kërkesë që fillon me /api/products, dërgoje te folderi routes
app.use('/api/products', productRoutes); 

app.get('/', (req, res) => {
    res.send('Serveri dhe Databaza janë gati! 🚀');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveri po punon në portën: ${PORT}`);
});