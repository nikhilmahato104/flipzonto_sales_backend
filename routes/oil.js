const express = require('express');
const router = express.Router();
const Oil = require('../models/Oil'); // ✅ Import Oil model
const authMiddleware = require('../middleware/auth');

// 🔓 PUBLIC ROUTE: Fetch all oils for frontend
router.get('/api', async (req, res) => {
  try {
    const oils = await Oil.find();
    res.json(oils);
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

    const oil = await Oil.findById(req.params.id);
    if (!oil) {
      return res.status(404).json({ message: 'Oil not found' });
    }

    if (oil.available_jar < qty) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    oil.available_jar -= qty;
    await oil.save();

    res.json({ message: 'Stock updated successfully!', updated: oil });
  } catch (err) {
    console.error('❌ PUT error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔐 ADMIN ONLY: View all oils
router.get('/', authMiddleware, async (req, res) => {
  try {
    const oils = await Oil.find({});
    res.render('oil/all', { oils });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Create form
router.get('/new', authMiddleware, (req, res) => {
  res.render('oil/create');
});

// 🔐 ADMIN ONLY: Create oil
router.post('/new', authMiddleware, async (req, res) => {
  try {
    await Oil.create(req.body);
    res.redirect('/oil');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Edit form
router.get('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const oil = await Oil.findById(req.params.id);
    res.render('oil/edit', { oil });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Update oil
router.post('/edit/:id', authMiddleware, async (req, res) => {
  try {
    await Oil.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/oil');
  } catch (err) {
    res.send('Update Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Delete oil
router.post('/delete/:id', authMiddleware, async (req, res) => {
  try {
    await Oil.findByIdAndDelete(req.params.id);
    res.redirect('/oil');
  } catch (err) {
    res.send('Delete Error: ' + err.message);
  }
});

module.exports = router;
