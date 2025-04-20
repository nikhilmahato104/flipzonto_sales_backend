const express = require('express');
const router = express.Router();
const Chocolate = require('../models/Chocolate');
const authMiddleware = require('../middleware/auth');

// 🔓 PUBLIC ROUTE: Fetch all chocolates for frontend
router.get('/api', async (req, res) => {
  try {
    const chocolates = await Chocolate.find();
    res.json(chocolates);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔓 PUBLIC ROUTE: Place chocolate order
router.put('/api/order/:id', async (req, res) => {
  try {
    const { qty } = req.body;
    const chocolate = await Chocolate.findById(req.params.id);

    if (!chocolate) {
      return res.status(404).json({ message: 'Chocolate not found' });
    }

    if (chocolate.available_jar < qty) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    chocolate.available_jar -= qty;
    await chocolate.save();

    res.json({ message: 'Order placed successfully!', updated: chocolate });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔐 ADMIN ONLY: View all chocolates
router.get('/', authMiddleware, async (req, res) => {
  try {
    const chocolates = await Chocolate.find({});
    res.render('chocolate/all', { chocolates });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Create form
router.get('/new', authMiddleware, (req, res) => {
  res.render('chocolate/create');
});

// 🔐 ADMIN ONLY: Create chocolate
router.post('/new', authMiddleware, async (req, res) => {
  try {
    await Chocolate.create(req.body);
    res.redirect('/chocolate');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Edit form
router.get('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const chocolate = await Chocolate.findById(req.params.id);
    res.render('chocolate/edit', { chocolate });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Update chocolate
router.post('/edit/:id', authMiddleware, async (req, res) => {
  try {
    await Chocolate.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/chocolate');
  } catch (err) {
    res.send('Update Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Delete chocolate
router.post('/delete/:id', authMiddleware, async (req, res) => {
  try {
    await Chocolate.findByIdAndDelete(req.params.id);
    res.redirect('/chocolate');
  } catch (err) {
    res.send('Delete Error: ' + err.message);
  }
});

module.exports = router;
