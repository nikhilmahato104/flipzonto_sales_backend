// routes/payment.js
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

router.post('/create-order', async (req, res) => {
  const { amount } = req.body; // amount in INR

  try {
    const options = {
      amount: Math.round(amount * 100), // in paisa
      currency: "INR",
      receipt: "receipt_order_" + new Date().getTime(),
    };

    const order = await razorpay.orders.create(options);
    return res.json({ success: true, order });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to create Razorpay order" });
  }
});

module.exports = router;
