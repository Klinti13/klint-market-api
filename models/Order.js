import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    orderItems: [
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
        }
    ],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        phone: { type: String, required: true },
    },
    totalPrice: { type: Number, required: true },
    status: { 
        type: String, 
        required: true, 
        // KËTU U BË OPERACIONI: Shtova fjalët e sakta shqip, dhe lashë ato 
        // anglisht thjesht që të mos të fshihen porositë e vjetra që kishe bërë provë.
        enum: ['Në Pritje', 'Porosia u mor', 'Porosia u dërgua', 'Pending', 'Shipped', 'Delivered', 'Paguar'], 
        default: 'Në Pritje' 
    },
    paymentMethod: { type: String, default: 'Cash on Delivery' }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);