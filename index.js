import path from 'path'; // SHTUAR PËR FOTOT
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js'; // SHTUAR PËR FOTOT

dotenv.config();

const app = express();

// RREGULLIMI I CORS: I hapim te gjitha dyert per cdo pajisje (celular/pc)
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// LIDHJA ME DATABAZEN
if (!process.env.MONGO_URI) {
    console.error('❌ Kujdes: MONGO_URI nuk u gjet!');
} else {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('✅ U lidhëm me sukses me MongoDB Atlas!'))
        .catch((err) => console.error('❌ Gabim MongoDB:', err.message));
}

// ROUTE-ET (I vendosim te gjitha bashke per pasterti)
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes); 
app.use('/api/upload', uploadRoutes); // SHTUAR PËR FOTOT

// SHTUAR PËR FOTOT: E bëjmë folderin 'uploads' të lexueshëm nga interneti
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => {
    res.send('Serveri dhe Databaza janë gati! 🚀 (Versioni Live)');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveri po punon në portën: ${PORT}`);
});