// routes/checkOrderById.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Order input form
router.get('/', (req, res) => {
  res.render('checkOrderForm');
});

// ✅ HTML View (EJS or similar)
router.get('/view/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();

    if (!order) return res.status(404).send('Order not found');

    const subtotal = order.cartItems.reduce((sum, item) => sum + item.rate * item.quantity, 0);

    res.render('orderView', {
      order,
      subtotal,
      formattedDate: new Date(order.orderDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// ✅ JSON API (for React, etc.)
router.get('/json/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const subtotal = order.cartItems.reduce((sum, item) => sum + item.rate * item.quantity, 0);
    res.json({ order, subtotal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
// Redirect handler after form submission
router.get('/redirect', (req, res) => {
  const orderId = req.query.orderId?.trim();
  if (!orderId) return res.send('Order ID is required.');
  res.redirect(`/check-order/view/${orderId}`);
});


module.exports = router;
