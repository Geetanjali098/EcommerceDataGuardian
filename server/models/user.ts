import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'analyst'], default: 'analyst' },
});

export const User = mongoose.model('User', userSchema);
