const express = require('express');
const router = express.Router();
const SalesmanAdmin = require('../models/SalesmanAdmin');
const authMiddleware = require('../middleware/auth'); // Ensures only admin can modify salesman accounts

// 🔐 ADMIN ONLY: Add a SalesmanAdmin
// 🔐 ADMIN ONLY: Add a SalesmanAdmin with unique name check
router.post('/add', authMiddleware, async (req, res) => {
    try {
        const { salesman_name, password } = req.body;

        // Check if the salesman name already exists in the database
        const existingSalesman = await SalesmanAdmin.findOne({ salesman_name });

        if (existingSalesman) {
            return res.status(400).json({ message: 'Salesman name already exists! Please choose a different name.' });
        }

        // Create and save the new salesman
        const newSalesman = new SalesmanAdmin({ salesman_name, password });
        await newSalesman.save();
        
        res.redirect('/salesman');
    } catch (err) {
        res.status(500).json({ message: 'Error adding salesman admin' });
    }
});


// 🔐 ADMIN ONLY: View all SalesmanAdmins
router.get('/', authMiddleware, async (req, res) => {
    try {
        const salesmen = await SalesmanAdmin.find({});
        res.render('salesman/all', { salesmen });
    } catch (err) {
        res.send('Error: ' + err.message);
    }
});

// 🔐 ADMIN ONLY: Edit form
router.get('/edit/:id', authMiddleware, async (req, res) => {
    try {
        const salesman = await SalesmanAdmin.findById(req.params.id);
        res.render('salesman/edit', { salesman });
    } catch (err) {
        res.send('Error: ' + err.message);
    }
});

// 🔐 ADMIN ONLY: Update salesman
router.post('/edit/:id', authMiddleware, async (req, res) => {
    try {
        await SalesmanAdmin.findByIdAndUpdate(req.params.id, req.body);
        res.redirect('/salesman');
    } catch (err) {
        res.send('Update Error: ' + err.message);
    }
});

// 🔐 ADMIN ONLY: Delete salesman
router.post('/delete/:id', authMiddleware, async (req, res) => {
    try {
        await SalesmanAdmin.findByIdAndDelete(req.params.id);
        res.redirect('/salesman');
    } catch (err) {
        res.send('Delete Error: ' + err.message);
    }
});

// 🔐 ADMIN ONLY: Create form for adding a new salesman
router.get('/new', authMiddleware, (req, res) => {
    res.render('salesman/create');
  });
  
module.exports = router;
