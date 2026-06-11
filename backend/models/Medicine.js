const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  barcode: { type: String, unique: true },
  quantity: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  category: { type: String },
  manufacturer: { type: String },
  expiryStatus: { type: String, enum: ['safe', 'expiring_soon', 'expired'], default: 'safe' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', MedicineSchema);