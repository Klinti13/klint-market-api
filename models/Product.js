import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number, required: false },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    category: { type: String, required: true },
    badge: { type: String, required: false }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;