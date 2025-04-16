require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();
const chocolateRoutes = require('./routes/chocolate');
app.use(express.static(path.join(__dirname, 'public')));
// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ DB Error:', err));

// Middleware
app.use(cors()); // Enable CORS for frontend connection
app.use(express.json()); // To parse JSON requests
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/chocolate', chocolateRoutes);

// Homepage
// app.get('/', (req, res) => {
//   res.send('<h1>🍫 Flipzonto Admin Panel</h1><a href="/admin">Go to Chocolate Panel</a>');
// });

// Admin Dashboard
app.get('/', (req, res) => {
  res.render('adminDashboard');
});

// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
