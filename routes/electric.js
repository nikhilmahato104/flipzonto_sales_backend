const express = require('express');
const router = express.Router();
const Electric = require('../models/Electric');
const authMiddleware = require('../middleware/auth');

// 🔓 PUBLIC ROUTE: Fetch all electric items for frontend
router.get('/api', async (req, res) => {
  try {
    const items = await Electric.find();
    res.json(items);
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

    const item = await Electric.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Electric item not found' });
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

// 🔐 ADMIN ONLY: View all electric items
router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await Electric.find({});
    res.render('electric/all', { items });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Create form
router.get('/new', authMiddleware, (req, res) => {
  res.render('electric/create');
});

// 🔐 ADMIN ONLY: Create electric item
router.post('/new', authMiddleware, async (req, res) => {
  try {
    await Electric.create(req.body);
    res.redirect('/electric');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Edit form
router.get('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Electric.findById(req.params.id);
    res.render('electric/edit', { item });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Update electric item
router.post('/edit/:id', authMiddleware, async (req, res) => {
  try {
    await Electric.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/electric');
  } catch (err) {
    res.send('Update Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Delete electric item
router.post('/delete/:id', authMiddleware, async (req, res) => {
  try {
    await Electric.findByIdAndDelete(req.params.id);
    res.redirect('/electric');
  } catch (err) {
    res.send('Delete Error: ' + err.message);
  }
});

module.exports = router;
