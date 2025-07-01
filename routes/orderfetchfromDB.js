const express = require('express');
const router = express.Router();
const Order = require('./models/Order');

// Toggle shipped status
router.post('/toggle-shipped/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).send('Order not found');
    }
    order.shipped = !order.shipped; // toggle the status
    await order.save();
    res.json({ success: true, shipped: order.shipped });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
