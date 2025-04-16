const express = require('express');
const router = express.Router();
const Chocolate = require('../models/Chocolate');

// ✅ API: Get all chocolates (for frontend)
router.get('/api', async (req, res) => {
  try {
    const chocolates = await Chocolate.find();
    res.json(chocolates);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Admin: View all (renders EJS view)
router.get('/', async (req, res) => {
  try {
    const chocolates = await Chocolate.find({});
    res.render('chocolate/all', { chocolates });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// ✅ Admin: Create new form
router.get('/new', (req, res) => {
  res.render('chocolate/create');
});

// ✅ Admin: Create chocolate
router.post('/new', async (req, res) => {
  try {
    await Chocolate.create(req.body);
    res.redirect('/chocolate');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// ✅ Admin: Edit form
router.get('/edit/:id', async (req, res) => {
  try {
    const chocolate = await Chocolate.findById(req.params.id);
    res.render('chocolate/edit', { chocolate });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// ✅ Admin: Update chocolate
router.post('/edit/:id', async (req, res) => {
  try {
    await Chocolate.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/chocolate');
  } catch (err) {
    res.send('Update Error: ' + err.message);
  }
});

// ✅ Admin: Delete chocolate
router.post('/delete/:id', async (req, res) => {
  try {
    await Chocolate.findByIdAndDelete(req.params.id);
    res.redirect('/chocolate');
  } catch (err) {
    res.send('Delete Error: ' + err.message);
  }
});

// ✅ Order Handler (shared logic)
const handleOrder = async (req, res) => {
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
    console.error('Order Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ API: Order chocolate from frontend
router.put('/order/:id', handleOrder);      // for frontend
router.put('/api/order/:id', handleOrder);  // optional alias (for API use)

module.exports = router;
