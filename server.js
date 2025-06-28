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
const twilio = require('twilio');

//Products routes
const babycareRoutes = require('./routes/babycare');  //bugs 1 X     working this
//const bathingsoapRoutes = require('./routes/bathingsoap');  // bugs 2 working this
const chocolateRoutes = require('./routes/chocolate');
const biscuitRoutes = require('./routes/biscuit');
const colddrinkRoutes = require('./routes/colddrink');
const drinkRoutes = require('./routes/drink');
const detergentbarRoutes = require('./routes/detergentbar');
const detergentpowderRoutes = require('./routes/detergentpowder');
const oilRoutes = require('./routes/oil');
const shampooRoutes = require('./routes/shampoo');
const kirnaRoutes = require('./routes/kirana');
const noodlesRoutes = require('./routes/noodles');
const napkinRoutes = require('./routes/napkin');     //bugs 3 X working this
const personalcareRoutes = require('./routes/personalcare'); // bugs 4 X working this
const snackRoutes = require('./routes/snack');
const teaRoutes = require('./routes/tea');  //bugs 5 X working this
const toothpasteRoutes = require('./routes/toothpaste'); //bugs 6 X working this.
const otherRoutes = require('./routes/other');




const authMiddleware = require('./middleware/auth');
const Order = require('./models/Order');  // Import Order model



//RAZORPAY
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});



const app = express();
app.set('trust proxy', 1); // Trust first proxy (like Render, Heroku, Nginx)

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
  'http://localhost:3001',
  'http://192.168.137.1:5173',
  'https://b-to-b-apixvuzum.onrender.com',
  'https://fzt-api-frilu457.onrender.com',
  'https://sales-manpanel-react-darkhower.netlify.app',

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

//this code is working both laptop and render
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

//this code working my new laptop for localhost
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, // Use 465 only if using secure: true
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


app.get('/login', (req, res) => {
  res.render('login');
});




// Twilio setup
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });

  if (!admin) return res.send('Invalid email or password');
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
    // Send OTP via Email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: [
        '26krakashyadav@gmail.com',
        'nikhilmahato104@gmail.com',
        'chandankumarsharma8124@gmail.com'
      ],
      subject,
      html: htmlMessage
    });

    // Send OTP via Twilio SMS to predefined Indian numbers
    const mobileRecipients = ['+919304260733', '+919661461412']; // <-- Replace with actual numbers

    for (const mobile of mobileRecipients) {
      await twilioClient.messages.create({
        body: `🔐 Flipzonto OTP: ${otp} (Sent on ${formattedDate})`,
        from: process.env.TWILIO_PHONE,
        to: mobile
      });
    }

    console.log('OTP sent via email and SMS');
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


const salesmanRoutes = require('./routes/salesman');
app.use('/salesman', salesmanRoutes);

const salesmanAuthRoutes = require('./routes/salesmanAuth');
app.use('/salesman-auth', salesmanAuthRoutes);

// products routes
app.use(babycareRoutes); // Baby Care
// app.use(bathingsoapRoutes); // Bathing Soap
app.use(chocolateRoutes); 
app.use(colddrinkRoutes);
app.use(biscuitRoutes);
app.use(drinkRoutes);
app.use(detergentpowderRoutes);
app.use(detergentbarRoutes);
app.use(oilRoutes);
app.use(shampooRoutes);
app.use(kirnaRoutes);
app.use(snackRoutes);
app.use(noodlesRoutes);
app.use(napkinRoutes); //napkin
app.use(personalcareRoutes); //personalcare
app.use(teaRoutes); //tea
app.use(toothpasteRoutes); //toothpaste
app.use(otherRoutes);

app.use('/babycare', babycareRoutes); //babycare
//app.use('/bathingsoap', bathingsoapRoutes); //bathingsoap
app.use('/biscuit', biscuitRoutes);
app.use('/chocolate', chocolateRoutes);
app.use('/colddrink', colddrinkRoutes);
app.use('/drink', drinkRoutes);
app.use('/detergentbar', detergentbarRoutes);
app.use('/detergentpowder', detergentpowderRoutes);
app.use('/kirana',kirnaRoutes);
app.use('/noodles', noodlesRoutes);
app.use('/napkin', napkinRoutes); //napkin
app.use('/snack', snackRoutes);
app.use('/oil',oilRoutes);
app.use('/shampoo',shampooRoutes);
app.use('/personalcare', personalcareRoutes); //personalcare
app.use('/tea', teaRoutes); //tea
app.use('/toothpaste', toothpasteRoutes); //toothpaste
app.use('/other',otherRoutes);

// Order Route
app.post("/api/orders", async (req, res) => {
  try {
    const orderDetails = req.body; // Get order details from request body

    // Create a new order
    const newOrder = new Order(orderDetails);

    // Save the order to the database
    await newOrder.save();

    // Respond with success
    res.json({ success: true });
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({ success: false, message: 'Error placing the order. Please try again.' });
  }
});

app.get('/orderfetchfromDB', async (req, res) => {
  try {
    const orders = await Order.find();
    res.render('orderfetchfromDB', { orders }); // render view with fetched orders
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

app.post('/toggle-shipped/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).send('Order not found');
    }
    order.shipped = !order.shipped; // toggle the status
    await order.save();
    res.status(200).json({ success: true, shipped: order.shipped });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// const Order = require("./models/Order");

//this code give give the order of the specific salesman for checking how much order he did.like if nikhil is ordering 10 orders then it will show the 10 orders of nikhil
app.get("/api/orders", async (req, res) => {
  try {
    const { salesmanName } = req.query; // Get salesman name from request

    if (!salesmanName) {
      return res.status(400).json({ success: false, message: "Salesman name is required" });
    }

    const orders = await Order.find({ salesmanName }); // Query MongoDB for orders matching salesman

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Error retrieving orders. Please try again." });
  }
});


const showAllProductDetails = require('./routes/showallproductdetails');
app.use('/',authMiddleware, showAllProductDetails);
//ye line ko yahi rakhna hain shoallproducts ka 
//ishi k karan error aaya thaa.
//beta-version-6   main ye line k karan hi error aaya tha.
//beta-version-6.5 is good
// server.js (or app.js)

//CHECK THE ORDER DETAILS BY THE HELP OF OORDER ID
const checkOrderById = require('./routes/checkOrderById');
app.use('/check-order', checkOrderById);



//RAZORPAY PAYMENT INTEGRATION
app.post('/api/create-order', async (req, res) => {
  const { amount } = req.body; // amount in rupees

  try {
    const order = await razorpayInstance.orders.create({
      amount: amount * 100, // Razorpay uses paisa
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('❌ Razorpay Order Error:', err);
    res.status(500).json({ success: false, message: 'Failed to create Razorpay order' });
  }
});

// Handle Razorpay payment verification
app.post('/api/verify-payment', async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderDetails
  } = req.body;

  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    const order = new Order(orderDetails);
    await order.save();

    res.json({ success: true, message: 'Payment verified and order saved!' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid payment signature' });
  }
});







const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
