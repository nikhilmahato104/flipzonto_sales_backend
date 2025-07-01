const express = require('express');
const router = express.Router();
const Personalcare = require('../models/Personalcare');
const authMiddleware = require('../middleware/auth');

// 🔓 PUBLIC ROUTE: Fetch all personalcare products for frontend
router.get('/api', async (req, res) => {
  try {
    const items = await Personalcare.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ FIXED SINGLE ROUTE FOR STOCK REDUCTION
router.put('/api/order/:id', async (req, res) => {
  try {
    const { qty } = req.body;

    // Validate quantity
    if (!qty || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: 'Invalid quantity provided' });
    }

    // Find item by ID
    const item = await Personalcare.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Personalcare item not found' });
    }

    // Check if enough stock is available
    if (item.available_jar < qty) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    // Update the stock
    item.available_jar -= qty;
    await item.save();

    // Respond with the updated stock info
    res.json({ message: 'Stock updated successfully!', updated: item });
  } catch (err) {
    console.error('❌ PUT error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔐 ADMIN ONLY: View all personalcare items
router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await Personalcare.find({});
    res.render('personalcare/all', { items });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Create form
router.get('/new', authMiddleware, (req, res) => {
  res.render('personalcare/create');
});

// 🔐 ADMIN ONLY: Create personalcare item
router.post('/new', authMiddleware, async (req, res) => {
  try {
    await Personalcare.create(req.body);
    res.redirect('/personalcare');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Edit form
router.get('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const personalcare = await Personalcare.findById(req.params.id);
    res.render('personalcare/edit', { personalcare });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Update personalcare item
router.post('/edit/:id', authMiddleware, async (req, res) => {
  try {
    await Personalcare.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/personalcare');
  } catch (err) {
    res.send('Update Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Delete personalcare item
router.post('/delete/:id', authMiddleware, async (req, res) => {
  try {
    await Personalcare.findByIdAndDelete(req.params.id);
    res.redirect('/personalcare');
  } catch (err) {
    res.send('Delete Error: ' + err.message);
  }
});

module.exports = router;
