const express = require('express');
const router = express.Router();
const Babycare = require('../models/Babycare');
const authMiddleware = require('../middleware/auth');

// 🔓 PUBLIC ROUTE: Fetch all babycare items for frontend
router.get('/api', async (req, res) => {
  try {
    const babycareItems = await Babycare.find();
    res.json(babycareItems);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ FIXED SINGLE ROUTE FOR STOCK REDUCTION ✅
router.put('/api/order/:id', async (req, res) => {
  try {
    const { qty } = req.body;

    if (!qty || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: 'Invalid quantity provided' });
    }

    const item = await Babycare.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.available_jar < qty) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    item.available_jar -= qty;
    await item.save();

    res.json({ message: 'Stock updated successfully!', updated: item });
  } catch (err) {
    console.error('❌ PUT error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔐 ADMIN ONLY: View all babycare items
router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await Babycare.find({});
    res.render('babycare/all', { items });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Create form
router.get('/new', authMiddleware, (req, res) => {
  res.render('babycare/create');
});

// 🔐 ADMIN ONLY: Create babycare item
router.post('/new', authMiddleware, async (req, res) => {
  try {
    await Babycare.create(req.body);
    res.redirect('/babycare');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Edit form
router.get('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Babycare.findById(req.params.id);
    res.render('babycare/edit', { item });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Update babycare item
router.post('/edit/:id', authMiddleware, async (req, res) => {
  try {
    await Babycare.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/babycare');
  } catch (err) {
    res.send('Update Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Delete babycare item
router.post('/delete/:id', authMiddleware, async (req, res) => {
  try {
    await Babycare.findByIdAndDelete(req.params.id);
    res.redirect('/babycare');
  } catch (err) {
    res.send('Delete Error: ' + err.message);
  }
});

module.exports = router;
