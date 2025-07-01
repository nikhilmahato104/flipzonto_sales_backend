const express = require('express');
const router = express.Router();
const DetergentPowder = require('../models/DetergentPowder');
const authMiddleware = require('../middleware/auth');

// 🔓 PUBLIC ROUTE: Fetch all detergent powders for frontend
router.get('/api', async (req, res) => {
  try {
    const powders = await DetergentPowder.find();
    res.json(powders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ ✅ ✅ FIXED SINGLE ROUTE FOR STOCK REDUCTION ✅ ✅ ✅
router.put('/api/order/:id', async (req, res) => {
  try {
    const { qty } = req.body;

    if (!qty || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: 'Invalid quantity provided' });
    }

    const powder = await DetergentPowder.findById(req.params.id);
    if (!powder) {
      return res.status(404).json({ message: 'Detergent powder not found' });
    }

    if (powder.available_jar < qty) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    powder.available_jar -= qty;
    await powder.save();

    res.json({ message: 'Stock updated successfully!', updated: powder });
  } catch (err) {
    console.error('❌ PUT error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔐 ADMIN ONLY: View all detergent powders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const powders = await DetergentPowder.find({});
    res.render('detergentpowder/all', { powders });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Create form
router.get('/new', authMiddleware, (req, res) => {
  res.render('detergentpowder/create');
});

// 🔐 ADMIN ONLY: Create detergent powder
router.post('/new', authMiddleware, async (req, res) => {
  try {
    await DetergentPowder.create(req.body);
    res.redirect('/detergentpowder');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Edit form
router.get('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const powder = await DetergentPowder.findById(req.params.id);
    res.render('detergentpowder/edit', { powder });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Update detergent powder
router.post('/edit/:id', authMiddleware, async (req, res) => {
  try {
    await DetergentPowder.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/detergentpowder');
  } catch (err) {
    res.send('Update Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Delete detergent powder
router.post('/delete/:id', authMiddleware, async (req, res) => {
  try {
    await DetergentPowder.findByIdAndDelete(req.params.id);
    res.redirect('/detergentpowder');
  } catch (err) {
    res.send('Delete Error: ' + err.message);
  }
});

module.exports = router;
