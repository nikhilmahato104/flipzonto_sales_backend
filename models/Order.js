
// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//   shopDetails: {
//     shopName: String,
//     shopOwnerName: String,
//     contact: String,
//     address: String,
//     region: String,
//     location: String,
//     imageUrl: String
//   },
//   cartItems: [
//     {
//       name: String,
//       image: String,
//       rate: Number,
//       quantity: Number,
//       category: String
//     }
//   ],
//   salesmanName: String,
//   salesmanContact: String,
//   comment: String,
//   orderDate: Date,
//   shipped: { 
//     type: Boolean, 
//     default: false 
//   } // <-- Added shipped status
// });

// const Order = mongoose.model('Order', orderSchema);
// module.exports = Order;





// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//   shopDetails: {
//     shopName: String,
//     shopOwnerName: String,
//     contact: String,
//     address: String,
//     region: String,
//     location: String,
//     imageUrl: String
//   },
//   cartItems: [
//     {
//       name: String,
//       image: String,
//       rate: Number,
//       quantity: Number,
//       category: String
//     }
//   ],
//   salesmanName: String,
//   salesmanContact: String,
//   comment: String,
//   orderDate: {
//     type: Date,
//     default: () => new Date().toISOString() // Store in UTC
//   },
//   shipped: { 
//     type: Boolean, 
//     default: false 
//   }
// });

// // Virtual to get the order date in 'Asia/Kolkata' timezone
// orderSchema.virtual('orderDateString').get(function() {
//   return this.orderDate
//     ? this.orderDate.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })
//     : '';
// });

// const Order = mongoose.model('Order', orderSchema);
// module.exports = Order;

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  shopDetails: {
    shopName: String,
    shopOwnerName: String,
    contact: String,
    address: String,
    region: String,
    location: String,
    imageUrl: String
  },
  cartItems: [
    {
      name: String,
      image: String,
      rate: Number,
      quantity: Number,
      category: String,
      brandName: String
    }
  ],
  salesmanName: String,
  salesmanContact: String,
  comment: String,
  orderDate: {
    type: Date,
    default: () => new Date().toISOString()
  },
  shipped: {
    type: Boolean,
    default: false
  }
});

// Virtual
orderSchema.virtual('orderDateString').get(function () {
  return this.orderDate
    ? this.orderDate.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })
    : '';
});

// ✅ Prevent OverwriteModelError
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

module.exports = Order;
