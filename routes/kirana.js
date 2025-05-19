const express = require('express');
const router = express.Router();
const Kirana = require('../models/Kirana'); // Import the Kirana model
const authMiddleware = require('../middleware/auth');

// 🔓 PUBLIC ROUTE: Fetch all kirana items for frontend
router.get('/api', async (req, res) => {
  try {
    const kiranas = await Kirana.find();
    res.json(kiranas);
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

    const kirana = await Kirana.findById(req.params.id);
    if (!kirana) {
      return res.status(404).json({ message: 'Kirana item not found' });
    }

    if (kirana.available_jar < qty) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    kirana.available_jar -= qty;
    await kirana.save();

    res.json({ message: 'Stock updated successfully!', updated: kirana });
  } catch (err) {
    console.error('❌ PUT error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔐 ADMIN: View all kirana items
router.get('/', authMiddleware, async (req, res) => {
  try {
    const kiranas = await Kirana.find({});
    res.render('kirana/all', { kiranas });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN: Create form
router.get('/new', authMiddleware, (req, res) => {
  res.render('kirana/create');
});

// 🔐 ADMIN: Create kirana item
router.post('/new', authMiddleware, async (req, res) => {
  try {
    await Kirana.create(req.body);
    res.redirect('/kirana');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN: Edit form
router.get('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const kirana = await Kirana.findById(req.params.id);
    res.render('kirana/edit', { kirana });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN: Update kirana item
router.post('/edit/:id', authMiddleware, async (req, res) => {
  try {
    await Kirana.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/kirana');
  } catch (err) {
    res.send('Update Error: ' + err.message);
  }
});

// 🔐 ADMIN: Delete kirana item
router.post('/delete/:id', authMiddleware, async (req, res) => {
  try {
    await Kirana.findByIdAndDelete(req.params.id);
    res.redirect('/kirana');
  } catch (err) {
    res.send('Delete Error: ' + err.message);
  }
});

module.exports = router;
