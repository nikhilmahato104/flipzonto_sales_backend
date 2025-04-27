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
//   orderDate: Date
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
      category: String
    }
  ],
  salesmanName: String,
  salesmanContact: String,
  comment: String,
  orderDate: Date,
  shipped: { 
    type: Boolean, 
    default: false 
  } // <-- Added shipped status
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
