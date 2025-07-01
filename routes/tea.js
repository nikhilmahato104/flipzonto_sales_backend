const express = require('express');
const router = express.Router();
const Tea = require('../models/Tea');
const authMiddleware = require('../middleware/auth');

// 🔓 PUBLIC ROUTE: Fetch all tea products for frontend
router.get('/api', async (req, res) => {
  try {
    const teas = await Tea.find();
    res.json(teas);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ STOCK REDUCTION
router.put('/api/order/:id', async (req, res) => {
  try {
    const { qty } = req.body;

    if (!qty || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: 'Invalid quantity provided' });
    }

    const tea = await Tea.findById(req.params.id);
    if (!tea) {
      return res.status(404).json({ message: 'Tea not found' });
    }

    if (tea.available_jar < qty) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    tea.available_jar -= qty;
    await tea.save();

    res.json({ message: 'Stock updated successfully!', updated: tea });
  } catch (err) {
    console.error('❌ PUT error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔐 ADMIN ONLY: View all teas
router.get('/', authMiddleware, async (req, res) => {
  try {
    const teas = await Tea.find({});
    res.render('tea/all', { teas });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Create form
router.get('/new', authMiddleware, (req, res) => {
  res.render('tea/create');
});

// 🔐 ADMIN ONLY: Create tea
router.post('/new', authMiddleware, async (req, res) => {
  try {
    await Tea.create(req.body);
    res.redirect('/tea');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Edit form
router.get('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const tea = await Tea.findById(req.params.id);
    res.render('tea/edit', { tea });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Update tea
router.post('/edit/:id', authMiddleware, async (req, res) => {
  try {
    await Tea.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/tea');
  } catch (err) {
    res.send('Update Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Delete tea
router.post('/delete/:id', authMiddleware, async (req, res) => {
  try {
    await Tea.findByIdAndDelete(req.params.id);
    res.redirect('/tea');
  } catch (err) {
    res.send('Delete Error: ' + err.message);
  }
});

module.exports = router;
