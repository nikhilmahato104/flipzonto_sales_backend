const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SalesmanAdmin = require('../models/SalesmanAdmin');

// ✅ Salesman Login
router.post('/login', async (req, res) => {
  const { salesman_name, password } = req.body;

  try {
    const user = await SalesmanAdmin.findOne({ salesman_name });
    if (!user) return res.status(401).json({ message: 'Invalid name or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    // JWT creation
    const token = jwt.sign(
      { id: user._id, name: user.salesman_name },
      process.env.JWT_SECRET || 'verysecretkey',
      { expiresIn: '1d' }
    );

    res.status(200).json({ token, name: user.salesman_name });
  } catch (err) {
    console.error('Salesman login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

const salesmanAuth = require('../middleware/salesmanAuth');

router.get('/dashboard', salesmanAuth, (req, res) => {
  res.status(200).json({ message: `Welcome, ${req.salesman.name}!` });
});


module.exports = router;
