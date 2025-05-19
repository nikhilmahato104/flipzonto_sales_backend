const express = require('express');
const router = express.Router();
const Shampoo = require('../models/Shampoo'); // ✅ Import the Shampoo model
const authMiddleware = require('../middleware/auth');

// 🔓 PUBLIC ROUTE: Fetch all shampoos for frontend
router.get('/api', async (req, res) => {
  try {
    const shampoos = await Shampoo.find();
    res.json(shampoos);
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

    const shampoo = await Shampoo.findById(req.params.id);
    if (!shampoo) {
      return res.status(404).json({ message: 'Shampoo not found' });
    }

    if (shampoo.available_jar < qty) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    shampoo.available_jar -= qty;
    await shampoo.save();

    res.json({ message: 'Stock updated successfully!', updated: shampoo });
  } catch (err) {
    console.error('❌ PUT error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔐 ADMIN: View all shampoos
router.get('/', authMiddleware, async (req, res) => {
  try {
    const shampoos = await Shampoo.find({});
    res.render('shampoo/all', { shampoos });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN: Create form
router.get('/new', authMiddleware, (req, res) => {
  res.render('shampoo/create');
});

// 🔐 ADMIN: Create shampoo
router.post('/new', authMiddleware, async (req, res) => {
  try {
    await Shampoo.create(req.body);
    res.redirect('/shampoo');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN: Edit form
router.get('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const shampoo = await Shampoo.findById(req.params.id);
    res.render('shampoo/edit', { shampoo });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN: Update shampoo
router.post('/edit/:id', authMiddleware, async (req, res) => {
  try {
    await Shampoo.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/shampoo');
  } catch (err) {
    res.send('Update Error: ' + err.message);
  }
});

// 🔐 ADMIN: Delete shampoo
router.post('/delete/:id', authMiddleware, async (req, res) => {
  try {
    await Shampoo.findByIdAndDelete(req.params.id);
    res.redirect('/shampoo');
  } catch (err) {
    res.send('Delete Error: ' + err.message);
  }
});

module.exports = router;
