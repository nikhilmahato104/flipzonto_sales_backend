const express = require('express');
const router = express.Router();
const Snack = require('../models/Snack');
const authMiddleware = require('../middleware/auth');

// 🔓 PUBLIC ROUTE: Fetch all snacks for frontend
router.get('/api', async (req, res) => {
  try {
    const snacks = await Snack.find();
    res.json(snacks);
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

    const snack = await Snack.findById(req.params.id);
    if (!snack) {
      return res.status(404).json({ message: 'Snack not found' });
    }

    if (snack.available_jar < qty) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    snack.available_jar -= qty;
    await snack.save();

    res.json({ message: 'Stock updated successfully!', updated: snack });
  } catch (err) {
    console.error('❌ PUT error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔐 ADMIN ONLY: View all snacks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const snacks = await Snack.find({});
    res.render('snack/all', { snacks });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Create form
router.get('/new', authMiddleware, (req, res) => {
  res.render('snack/create');
});

// 🔐 ADMIN ONLY: Create snack
router.post('/new', authMiddleware, async (req, res) => {
  try {
    await Snack.create(req.body);
    res.redirect('/snack');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Edit form
router.get('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const snack = await Snack.findById(req.params.id);
    res.render('snack/edit', { snack });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Update snack
router.post('/edit/:id', authMiddleware, async (req, res) => {
  try {
    await Snack.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/snack');
  } catch (err) {
    res.send('Update Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Delete snack
router.post('/delete/:id', authMiddleware, async (req, res) => {
  try {
    await Snack.findByIdAndDelete(req.params.id);
    res.redirect('/snack');
  } catch (err) {
    res.send('Delete Error: ' + err.message);
  }
});

module.exports = router;
