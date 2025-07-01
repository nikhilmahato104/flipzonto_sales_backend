const express = require('express');
const router = express.Router();
const Noodles = require('../models/Noodles');
const authMiddleware = require('../middleware/auth');

// 🔓 PUBLIC ROUTE: Fetch all noodles for frontend
router.get('/api', async (req, res) => {
  try {
    const noodles = await Noodles.find();
    res.json(noodles);
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

    const noodle = await Noodles.findById(req.params.id);
    if (!noodle) {
      return res.status(404).json({ message: 'Noodle not found' });
    }

    if (noodle.available_jar < qty) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    noodle.available_jar -= qty;
    await noodle.save();

    res.json({ message: 'Stock updated successfully!', updated: noodle });
  } catch (err) {
    console.error('❌ PUT error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔐 ADMIN ONLY: View all noodles
router.get('/', authMiddleware, async (req, res) => {
  try {
    const noodles = await Noodles.find({});
    res.render('noodles/all', { noodles });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Create form
router.get('/new', authMiddleware, (req, res) => {
  res.render('noodles/create');
});

// 🔐 ADMIN ONLY: Create noodle
router.post('/new', authMiddleware, async (req, res) => {
  try {
    await Noodles.create(req.body);
    res.redirect('/noodles');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Edit form
router.get('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const noodle = await Noodles.findById(req.params.id);
    res.render('noodles/edit', { noodle });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Update noodle
router.post('/edit/:id', authMiddleware, async (req, res) => {
  try {
    await Noodles.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/noodles');
  } catch (err) {
    res.send('Update Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Delete noodle
router.post('/delete/:id', authMiddleware, async (req, res) => {
  try {
    await Noodles.findByIdAndDelete(req.params.id);
    res.redirect('/noodles');
  } catch (err) {
    res.send('Delete Error: ' + err.message);
  }
});

module.exports = router;
