const express = require('express');
const router = express.Router();
const Colddrink = require('../models/Colddrink');
const authMiddleware = require('../middleware/auth');

// 🔓 PUBLIC ROUTE: Fetch all colddrinks for frontend
router.get('/api', async (req, res) => {
  try {
    const colddrinks = await Colddrink.find();
    res.json(colddrinks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ ✅ ✅ FIXED SINGLE ROUTE FOR STOCK REDUCTION ✅ ✅ ✅
router.put('/api/order/:id', async (req, res) => {
  try {
    const { qty } = req.body;

    if (!qty || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: 'Invalid quantity provided' });
    }

    const colddrink = await Colddrink.findById(req.params.id);
    if (!colddrink) {
      return res.status(404).json({ message: 'Colddrink not found' });
    }

    if (colddrink.available_jar < qty) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    colddrink.available_jar -= qty;
    await colddrink.save();

    res.json({ message: 'Stock updated successfully!', updated: colddrink });
  } catch (err) {
    console.error('❌ PUT error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔐 ADMIN ONLY: View all colddrinks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const colddrinks = await Colddrink.find({});
    res.render('colddrink/all', { colddrinks });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Create form
router.get('/new', authMiddleware, (req, res) => {
  res.render('colddrink/create');
});

// 🔐 ADMIN ONLY: Create colddrink
router.post('/new', authMiddleware, async (req, res) => {
  try {
    await Colddrink.create(req.body);
    res.redirect('/colddrink');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Edit form
router.get('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const colddrink = await Colddrink.findById(req.params.id);
    res.render('colddrink/edit', { colddrink });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Update colddrink
router.post('/edit/:id', authMiddleware, async (req, res) => {
  try {
    await Colddrink.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/colddrink');
  } catch (err) {
    res.send('Update Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Delete colddrink
router.post('/delete/:id', authMiddleware, async (req, res) => {
  try {
    await Colddrink.findByIdAndDelete(req.params.id);
    res.redirect('/colddrink');
  } catch (err) {
    res.send('Delete Error: ' + err.message);
  }
});

module.exports = router;
