// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const path = require('path');
// const session = require('express-session');
// const MongoStore = require('connect-mongo');
// const bcrypt = require('bcryptjs');
// const nodemailer = require('nodemailer');
// const cors = require('cors');

// const Admin = require('./models/Admin');
// const chocolateRoutes = require('./routes/chocolate');
// const authMiddleware = require('./middleware/auth');

// const app = express();

// // ✅ MongoDB Connection
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => console.log('✅ MongoDB connected'))
//   .catch(err => console.error('❌ DB Error:', err));

// // ✅ Middleware Setup
// app.use(cors({
//   origin: '*', // Or restrict to frontend domain
//   methods: ['GET', 'POST', 'PUT'],
// }));
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(express.static(path.join(__dirname, 'public')));

// // ✅ Sessions
// app.use(session({
//   secret: process.env.SESSION_SECRET || 'supersecretkey',
//   resave: false,
//   saveUninitialized: false,
//   store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
//   cookie: {
//     maxAge: 1000 * 60 * 60 // 1 hour
//   }
// }));

// // ✅ View Engine
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// // ✅ Nodemailer setup
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// // ✅ Login Page
// app.get('/login', (req, res) => {
//   res.render('login');
// });

// // ✅ Login Handler with OTP
// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   const admin = await Admin.findOne({ email });

//   if (!admin) return res.send('❌ Invalid email or password');

//   const isMatch = await bcrypt.compare(password, admin.password);
//   if (!isMatch) return res.send('❌ Invalid email or password');

//   const otp = Math.floor(100000 + Math.random() * 900000);
//   req.session.tempAuth = true;
//   req.session.adminEmail = email;
//   req.session.otp = otp;

//   const now = new Date();
//   const formattedDate = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

//   const subject = `Flipzonto Admin Login OTP - ${formattedDate}`;
//   const htmlMessage = `
//     <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: auto; padding: 1.5rem; background: #f9f9f9; border-radius: 8px; border: 1px solid #e0e0e0;">
//       <h2 style="color: #1e3a8a;">🔐 Flipzonto Admin OTP</h2>
//       <p style="font-size: 16px;">Your One-Time Password (OTP) for login is:</p>
//       <p style="font-size: 24px; font-weight: bold; color: #d00000;">${otp}</p>
//       <p style="font-size: 14px; color: #555;">Date & Time: ${formattedDate}</p>
//       <hr style="margin: 1.5rem 0;">
//       <p style="font-size: 14px; color: #888;">If you face any issues, please contact developer <strong>Nikhil Mahato</strong> or the team at <strong>FreelancerPro, INDIA</strong>.</p>
//     </div>
//   `;

//   try {
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: ['26krakashyadav@gmail.com', 'nikhilmahato104@gmail.com'],
//       subject,
//       html: htmlMessage
//     });

//     console.log('✅ OTP sent to both admins');
//     res.render('otp');
//   } catch (err) {
//     console.error('❌ Failed to send OTP:', err.message);
//     res.send('❌ Failed to send OTP. Please try again.');
//   }
// });

// // ✅ OTP Verification
// app.post('/verify-otp', (req, res) => {
//   const { otp } = req.body;

//   if (req.session.tempAuth && req.session.otp == otp) {
//     req.session.isAuth = true;
//     delete req.session.tempAuth;
//     delete req.session.otp;
//     return res.redirect('/');
//   }

//   req.session.destroy(() => {
//     res.redirect('/login');
//   });
// });

// // ✅ Logout
// app.get('/logout', (req, res) => {
//   req.session.destroy(err => {
//     if (err) console.log(err);
//     res.redirect('/login');
//   });
// });

// // ✅ Admin Dashboard
// app.get('/', authMiddleware, (req, res) => {
//   res.render('adminDashboard');
// });

// // ✅ Routes (admin + public API inside)
// app.use('/chocolate', chocolateRoutes);

// // ✅ Start Server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
// });




require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const cors = require('cors');

const Admin = require('./models/Admin');
const chocolateRoutes = require('./routes/chocolate');
const authMiddleware = require('./middleware/auth');

const app = express();

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ DB Error:', err));

// ✅ Middleware Setup
// app.use(cors({
//   origin: 'https://flipzonto.com', // Only allow frontend site
//   methods: ['GET', 'POST', 'PUT'],
//   credentials: true
// }));
const allowedOrigins = [
  'https://flipzonto.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'https://b-to-b-apixvuzum.onrender.com' // ✅ added this
];



app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  methods: ['GET', 'POST', 'PUT'],
  credentials: true
}));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    maxAge: 1000 * 60 * 60, 
    secure: false 
  }
}));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


app.get('/login', (req, res) => {
  res.render('login');
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });

  if (!admin) return res.send(' Invalid email or password');
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return res.send('Invalid email or password');

  const otp = Math.floor(100000 + Math.random() * 900000);
  req.session.tempAuth = true;
  req.session.adminEmail = email;
  req.session.otp = otp;

  const now = new Date();
  const formattedDate = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const subject = `Flipzonto Admin Login OTP - ${formattedDate}`;
  const htmlMessage = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: auto; padding: 1.5rem; background: #f9f9f9; border-radius: 8px; border: 1px solid #e0e0e0;">
      <h2 style="color: #1e3a8a;">🔐 Flipzonto Admin OTP</h2>
      <p>Your OTP is:</p>
      <h1 style="color: red;">${otp}</h1>
      <p style="color: gray;">Date: ${formattedDate}</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: ['26krakashyadav@gmail.com', 'nikhilmahato104@gmail.com'],
      subject,
      html: htmlMessage
    });

    console.log(' OTP sent');
    res.render('otp');
  } catch (err) {
    console.error('Failed to send OTP:', err.message);
    res.send('Failed to send OTP. Please try again.');
  }
});


app.post('/verify-otp', (req, res) => {
  const { otp } = req.body;

  if (req.session.tempAuth && req.session.otp == otp) {
    req.session.isAuth = true;
    delete req.session.tempAuth;
    delete req.session.otp;
    return res.redirect('/');
  }

  req.session.destroy(() => {
    res.redirect('/login');
  });
});


app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.log(err);
    res.redirect('/login');
  });
});


app.get('/', authMiddleware, (req, res) => {
  res.render('adminDashboard');
});


app.use('/chocolate', chocolateRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
