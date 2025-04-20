const express = require('express');
const router = express.Router();
const Chocolate = require('../models/Chocolate');

// 🔓 PUBLIC: API to get all chocolates (for frontend)
router.get('/api', async (req, res) => {
  try {
    const chocolates = await Chocolate.find();
    res.json(chocolates);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔓 PUBLIC: Place chocolate order (for frontend)
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

// 🔐 ADMIN: View all chocolates
router.get('/', async (req, res) => {
  try {
    const chocolates = await Chocolate.find({});
    res.render('chocolate/all', { chocolates });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN: Create form
router.get('/new', (req, res) => {
  res.render('chocolate/create');
});

// 🔐 ADMIN: Create chocolate
router.post('/new', async (req, res) => {
  try {
    await Chocolate.create(req.body);
    res.redirect('/chocolate');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN: Edit form
router.get('/edit/:id', async (req, res) => {
  try {
    const chocolate = await Chocolate.findById(req.params.id);
    res.render('chocolate/edit', { chocolate });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// 🔐 ADMIN: Update chocolate
router.post('/edit/:id', async (req, res) => {
  try {
    await Chocolate.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/chocolate');
  } catch (err) {
    res.send('Update Error: ' + err.message);
  }
});

// 🔐 ADMIN: Delete chocolate
router.post('/delete/:id', async (req, res) => {
  try {
    await Chocolate.findByIdAndDelete(req.params.id);
    res.redirect('/chocolate');
  } catch (err) {
    res.send('Delete Error: ' + err.message);
  }
});

module.exports = router;
