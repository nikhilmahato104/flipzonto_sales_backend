const express = require('express');
const router = express.Router();
const Napkin = require('../models/Napkin'); // Ensure this path is correct
const authMiddleware = require('../middleware/auth');

// 🔓 PUBLIC ROUTE: Fetch all napkins for frontend
router.get('/api', async (req, res) => {
  try {
    const napkins = await Napkin.find();
    res.json(napkins);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ STOCK REDUCTION ROUTE
router.put('/api/order/:id', async (req, res) => {
  try {
    const { qty } = req.body;

    if (!qty || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: 'Invalid quantity provided' });
    }

    const napkin = await Napkin.findById(req.params.id);
    if (!napkin) {
      return res.status(404).json({ message: 'Napkin not found' });
    }

    if (napkin.available_jar < qty) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    napkin.available_jar -= qty;
    await napkin.save();

    res.json({ message: 'Stock updated successfully!', updated: napkin });
  } catch (err) {
    console.error('❌ PUT error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔐 ADMIN ONLY: View all napkins
router.get('/', authMiddleware, async (req, res) => {
  try {
    const napkins = await Napkin.find({});
    res.render('napkin/all', { napkins });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Create form
router.get('/new', authMiddleware, (req, res) => {
  res.render('napkin/create');
});

// 🔐 ADMIN ONLY: Create napkin
router.post('/new', authMiddleware, async (req, res) => {
  try {
    await Napkin.create(req.body);
    res.redirect('/napkin');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Edit form
router.get('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const napkin = await Napkin.findById(req.params.id);
    res.render('napkin/edit', { napkin });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Update napkin
router.post('/edit/:id', authMiddleware, async (req, res) => {
  try {
    await Napkin.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/napkin');
  } catch (err) {
    res.send('Update Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Delete napkin
router.post('/delete/:id', authMiddleware, async (req, res) => {
  try {
    await Napkin.findByIdAndDelete(req.params.id);
    res.redirect('/napkin');
  } catch (err) {
    res.send('Delete Error: ' + err.message);
  }
});

module.exports = router;
