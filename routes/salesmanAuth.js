

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SalesmanAdmin = require('../models/SalesmanAdmin');
const rateLimit = require("express-rate-limit");

// Create the rate limiter with a custom function to suppress the log for 429 errors
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many login attempts, please try again later.",

});

router.post('/login', loginLimiter, async (req, res) => {
  const { salesman_name, password } = req.body;

  try {
    const user = await SalesmanAdmin.findOne({ salesman_name });

    // Instead of sending 401, always return 200 OK with a generic message.
    if (!user || !await bcrypt.compare(password, user.password)) {
      // Send a generic message without indicating which field is wrong
      return res.status(200).json({ message: 'Login failed. Please check your credentials.' });
    }

    const token = jwt.sign(
      { id: user._id, name: user.salesman_name },
      process.env.JWT_SECRET || 'verysecretkey',
      { expiresIn: '1d' }
    );

    res.status(200).json({ token, name: user.salesman_name });
  } catch (err) {
    console.error('Salesman login error:', err);
    // Return a generic message for server errors too
    res.status(200).json({ message: 'An error occurred. Please try again later.' });
  }
});
module.exports = router;
