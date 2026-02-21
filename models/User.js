import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    points: { type: Number, default: 0 },
    
    // Fushat e adresës
    address: { type: String, default: '' },
    city: { type: String, default: 'Elbasan' },
    phone: { type: String, default: '' }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    // MAGJIA KËTU: Fjala 'return' e ndalon serverin të prishë fjalëkalimin!
    if (!this.isModified('password')) {
        return next(); 
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);