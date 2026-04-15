import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String }, // Phone is optional if logged in via Google
  password: { 
    type: String, 
    required: function() { return !this.googleId; } // Password required only if not using Google Auth
  },
  googleId: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false }, // Useful for OTP verification states
  purchasedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
  savedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);
