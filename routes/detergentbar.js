const express = require('express');
const router = express.Router();
const DetergentBar = require('../models/DetergentBar');
const authMiddleware = require('../middleware/auth');

// 🔓 PUBLIC ROUTE: Fetch all detergent bars for frontend
router.get('/api', async (req, res) => {
  try {
    const detergentBars = await DetergentBar.find();
    res.json(detergentBars);
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

    // Find detergent bar by ID
    const detergentBar = await DetergentBar.findById(req.params.id);
    if (!detergentBar) {
      return res.status(404).json({ message: 'Detergent bar not found' });
    }

    // Check if enough stock is available
    if (detergentBar.available_jar < qty) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    // Update the stock
    detergentBar.available_jar -= qty;
    await detergentBar.save();

    // Respond with the updated stock info
    res.json({ message: 'Stock updated successfully!', updated: detergentBar });
  } catch (err) {
    console.error('❌ PUT error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔐 ADMIN ONLY: View all detergent bars
router.get('/', authMiddleware, async (req, res) => {
  try {
    const detergentBars = await DetergentBar.find({});
    res.render('detergentbar/all', { detergentBars });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Create form
router.get('/new', authMiddleware, (req, res) => {
  res.render('detergentbar/create');
});

// 🔐 ADMIN ONLY: Create detergent bar
router.post('/new', authMiddleware, async (req, res) => {
  try {
    await DetergentBar.create(req.body);
    res.redirect('/detergentbar');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Edit form
router.get('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const detergentBar = await DetergentBar.findById(req.params.id);
    res.render('detergentbar/edit', { detergentBar });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Update detergent bar
router.post('/edit/:id', authMiddleware, async (req, res) => {
  try {
    await DetergentBar.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/detergentbar');
  } catch (err) {
    res.send('Update Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Delete detergent bar
router.post('/delete/:id', authMiddleware, async (req, res) => {
  try {
    await DetergentBar.findByIdAndDelete(req.params.id);
    res.redirect('/detergentbar');
  } catch (err) {
    res.send('Delete Error: ' + err.message);
  }
});

module.exports = router;
