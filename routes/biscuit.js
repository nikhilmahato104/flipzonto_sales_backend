const express = require('express');
const router = express.Router();
const Biscuit = require('../models/Biscuit');
const authMiddleware = require('../middleware/auth');

// PUBLIC ROUTE: Fetch all biscuits for frontend
router.get('/api', async (req, res) => {
  try {
    const biscuits = await Biscuit.find();
    res.json(biscuits);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

//  FIXED SINGLE ROUTE FOR STOCK REDUCTION 
router.put('/api/order/:id', async (req, res) => {
  try {
    const { qty } = req.body;

    // Validate quantity
    if (!qty || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: 'Invalid quantity provided' });
    }

    // Find biscuit by ID
    const biscuit = await Biscuit.findById(req.params.id);
    if (!biscuit) {
      return res.status(404).json({ message: 'Biscuit not found' });
    }

    // Check if enough stock is available
    if (biscuit.available_jar < qty) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    // Update the stock
    biscuit.available_jar -= qty;
    await biscuit.save();

    // Respond with the updated stock info
    res.json({ message: 'Stock updated successfully!', updated: biscuit });
  } catch (err) {
    console.error(' PUT error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

//  ADMIN ONLY: View all biscuits
router.get('/', authMiddleware, async (req, res) => {
  try {
    const biscuits = await Biscuit.find({});
    res.render('biscuit/all', { biscuits });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

//  ADMIN ONLY: Create form
router.get('/new', authMiddleware, (req, res) => {
  res.render('biscuit/create');
});

//  ADMIN ONLY: Create biscuit
router.post('/new', authMiddleware, async (req, res) => {
  try {
    await Biscuit.create(req.body);
    res.redirect('/biscuit');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

//  ADMIN ONLY: Edit form
router.get('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const biscuit = await Biscuit.findById(req.params.id);
    res.render('biscuit/edit', { biscuit });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

//  ADMIN ONLY: Update biscuit
router.post('/edit/:id', authMiddleware, async (req, res) => {
  try {
    await Biscuit.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/biscuit');
  } catch (err) {
    res.send('Update Error: ' + err.message);
  }
});

//  ADMIN ONLY: Delete biscuit
router.post('/delete/:id', authMiddleware, async (req, res) => {
  try {
    await Biscuit.findByIdAndDelete(req.params.id);
    res.redirect('/biscuit');
  } catch (err) {
    res.send('Delete Error: ' + err.message);
  }
});

module.exports = router;
