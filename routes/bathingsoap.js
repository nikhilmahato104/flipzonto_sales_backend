const express = require('express');
const router = express.Router();
const BathingSoap = require('../models/BathingSoap');
const authMiddleware = require('../middleware/auth');

// 🔓 PUBLIC ROUTE: Fetch all soaps for frontend
router.get('/api', async (req, res) => {
  try {
    const soaps = await BathingSoap.find();
    res.json(soaps);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ FIXED SINGLE ROUTE FOR STOCK REDUCTION ✅
router.put('/api/order/:id', async (req, res) => {
  try {
    const { qty } = req.body;

    if (!qty || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: 'Invalid quantity provided' });
    }

    const soap = await BathingSoap.findById(req.params.id);
    if (!soap) {
      return res.status(404).json({ message: 'Bathing soap not found' });
    }

    if (soap.available_jar < qty) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    soap.available_jar -= qty;
    await soap.save();

    res.json({ message: 'Stock updated successfully!', updated: soap });
  } catch (err) {
    console.error('❌ PUT error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔐 ADMIN ONLY: View all soaps
router.get('/', authMiddleware, async (req, res) => {
  try {
    const soaps = await BathingSoap.find({});
    res.render('bathingSoap/all', { soaps });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Create form
router.get('/new', authMiddleware, (req, res) => {
  res.render('bathingSoap/create');
});

// 🔐 ADMIN ONLY: Create soap
router.post('/new', authMiddleware, async (req, res) => {
  try {
    await BathingSoap.create(req.body);
    res.redirect('/bathingSoap');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Edit form
router.get('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const soap = await BathingSoap.findById(req.params.id);
    res.render('bathingSoap/edit', { soap });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Update soap
router.post('/edit/:id', authMiddleware, async (req, res) => {
  try {
    await BathingSoap.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/bathingSoap');
  } catch (err) {
    res.send('Update Error: ' + err.message);
  }
});

// 🔐 ADMIN ONLY: Delete soap
router.post('/delete/:id', authMiddleware, async (req, res) => {
  try {
    await BathingSoap.findByIdAndDelete(req.params.id);
    res.redirect('/bathingSoap');
  } catch (err) {
    res.send('Delete Error: ' + err.message);
  }
});

module.exports = router;
