const express = require('express');
const router = express.Router();
const Toothpaste = require('../models/Toothpaste');
const authMiddleware = require('../middleware/auth');

// 🔓 PUBLIC ROUTE: Fetch all toothpaste items for frontend
router.get('/api', async (req, res) => {
  try {
    const toothpastes = await Toothpaste.find();
    res.json(toothpastes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ FIXED SINGLE ROUTE FOR STOCK REDUCTION
router.put('/api/order/:id', async (req, res) => {
  try {
    const { qty } = req.body;

    if (!qty || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: 'Invalid quantity provided' });
    }

    const toothpaste = await Toothpaste.findById(req.params.id);
    if (!toothpaste) {
      return res.status(404).json({ message: 'Toothpaste not found' });
    }

    if (toothpaste.available_jar < qty) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    toothpaste.available_jar -= qty;
    await toothpaste.save();

    res.json({ message: 'Stock updated successfully!', updated: toothpaste });
  } catch (err) {
    console.error('❌ PUT error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔐 ADMIN: View all toothpastes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const toothpastes = await Toothpaste.find({});
    res.render('toothpaste/all', { toothpastes });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN: Create form
router.get('/new', authMiddleware, (req, res) => {
  res.render('toothpaste/create');
});

// 🔐 ADMIN: Create toothpaste
router.post('/new', authMiddleware, async (req, res) => {
  try {
    await Toothpaste.create(req.body);
    res.redirect('/toothpaste');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN: Edit form
router.get('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const toothpaste = await Toothpaste.findById(req.params.id);
    res.render('toothpaste/edit', { toothpaste });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN: Update toothpaste
router.post('/edit/:id', authMiddleware, async (req, res) => {
  try {
    await Toothpaste.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/toothpaste');
  } catch (err) {
    res.send('Update Error: ' + err.message);
  }
});

// 🔐 ADMIN: Delete toothpaste
router.post('/delete/:id', authMiddleware, async (req, res) => {
  try {
    await Toothpaste.findByIdAndDelete(req.params.id);
    res.redirect('/toothpaste');
  } catch (err) {
    res.send('Delete Error: ' + err.message);
  }
});

module.exports = router;
