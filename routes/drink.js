const express = require('express');
const router = express.Router();
const Drink = require('../models/Drink');
const authMiddleware = require('../middleware/auth');

// 🔓 PUBLIC ROUTE: Fetch all drinks for frontend
router.get('/api', async (req, res) => {
  try {
    const drinks = await Drink.find();
    res.json(drinks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ ✅ ✅ FIXED SINGLE ROUTE FOR STOCK REDUCTION ✅ ✅ ✅
router.put('/api/order/:id', async (req, res) => {
  try {
    const { qty } = req.body;

    // Validate quantity
    if (!qty || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: 'Invalid quantity provided' });
    }

    // Find drink by ID
    const drink = await Drink.findById(req.params.id);
    if (!drink) {
      return res.status(404).json({ message: 'Drink not found' });
    }

    // Check if enough stock is available
    if (drink.available_jar < qty) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    // Update the stock
    drink.available_jar -= qty;
    await drink.save();

    // Respond with the updated stock info
    res.json({ message: 'Stock updated successfully!', updated: drink });
  } catch (err) {
    console.error('❌ PUT error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔐 ADMIN ONLY: View all drinks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const drinks = await Drink.find({});
    res.render('drink/all', { drinks });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Create form
router.get('/new', authMiddleware, (req, res) => {
  res.render('drink/create');
});

// 🔐 ADMIN ONLY: Create drink
router.post('/new', authMiddleware, async (req, res) => {
  try {
    await Drink.create(req.body);
    res.redirect('/drink');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Edit form
router.get('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const drink = await Drink.findById(req.params.id);
    res.render('drink/edit', { drink });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Update drink
router.post('/edit/:id', authMiddleware, async (req, res) => {
  try {
    await Drink.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/drink');
  } catch (err) {
    res.send('Update Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Delete drink
router.post('/delete/:id', authMiddleware, async (req, res) => {
  try {
    await Drink.findByIdAndDelete(req.params.id);
    res.redirect('/drink');
  } catch (err) {
    res.send('Delete Error: ' + err.message);
  }
});

module.exports = router;
