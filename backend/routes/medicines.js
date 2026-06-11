const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const auth = require('../middleware/auth');

// GET all medicines for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const medicines = await Medicine.find({ user: req.user.userId });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST add new medicine
router.post('/', auth, async (req, res) => {
  try {
    const { name, barcode, quantity, expiryDate, category, manufacturer } = req.body;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    let expiryStatus = 'safe';
    if (daysLeft <= 0) expiryStatus = 'expired';
    else if (daysLeft <= 7) expiryStatus = 'expiring_soon';

    const medicine = new Medicine({
      name, barcode, quantity, expiryDate, category, manufacturer, expiryStatus,
      user: req.user.userId
    });
    await medicine.save();
    res.status(201).json(medicine);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT update medicine
router.put('/:id', auth, async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE medicine
router.delete('/:id', auth, async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ message: 'Medicine deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;