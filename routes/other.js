const express = require('express');
const router = express.Router();
const Other = require('../models/Other');
const authMiddleware = require('../middleware/auth');

// 🔓 PUBLIC ROUTE: Fetch all "other" items for frontend
router.get('/api', async (req, res) => {
  try {
    const others = await Other.find();
    res.json(others);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ STOCK REDUCTION (like for chocolate)
router.put('/api/order/:id', async (req, res) => {
  try {
    const { qty } = req.body;

    if (!qty || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: 'Invalid quantity provided' });
    }

    const other = await Other.findById(req.params.id);
    if (!other) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (other.available_jar < qty) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    other.available_jar -= qty;
    await other.save();

    res.json({ message: 'Stock updated successfully!', updated: other });
  } catch (err) {
    console.error('❌ PUT error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔐 ADMIN ONLY: View all
router.get('/', authMiddleware, async (req, res) => {
  try {
    const others = await Other.find({});
    res.render('other/all', { others });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Create form
router.get('/new', authMiddleware, (req, res) => {
  res.render('other/create');
});

// 🔐 ADMIN ONLY: Create item
router.post('/new', authMiddleware, async (req, res) => {
  try {
    await Other.create(req.body);
    res.redirect('/other');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Edit form
router.get('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const other = await Other.findById(req.params.id);
    res.render('other/edit', { other });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Update item
router.post('/edit/:id', authMiddleware, async (req, res) => {
  try {
    await Other.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/other');
  } catch (err) {
    res.send('Update Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Delete item
router.post('/delete/:id', authMiddleware, async (req, res) => {
  try {
    await Other.findByIdAndDelete(req.params.id);
    res.redirect('/other');
  } catch (err) {
    res.send('Delete Error: ' + err.message);
  }
});

module.exports = router;
