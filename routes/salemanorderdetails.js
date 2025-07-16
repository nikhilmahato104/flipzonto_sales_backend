// const express = require('express');
// const router = express.Router();
// const Order = require('../models/Order');

// const salesmen = ['Akash', 'Chandan', 'Rony', 'Manish', 'Nikhil'];

// router.get('/salemanorderdetails', async (req, res) => {
//   try {
//     const results = [];

//     const year = new Date().getFullYear(); // 2025

//     for (const name of salesmen) {
//       let monthlySales = Array(12).fill(0); // Jan to Dec

//       const orders = await Order.find({
//         salesmanName: name,
//         orderDate: {
//           $gte: new Date(`${year}-01-01T00:00:00.000Z`),
//           $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
//         },
//       });

//       orders.forEach((order) => {
//         const date = new Date(order.orderDate);
//         const month = date.getUTCMonth(); // 0-based index

//         const orderValue = order.cartItems.reduce((sum, item) => {
//           return sum + item.rate * item.quantity;
//         }, 0);

//         monthlySales[month] += orderValue;
//       });

//       results.push({ name, monthlySales });
//     }

//     res.render('salesman-cards', { results, year });
//   } catch (error) {
//     console.error('Error in monthly sales:', error);
//     res.status(500).send('Server Error');
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

const salesmen = ['Akash', 'Chandan', 'Rony', 'Manish'];

router.get('/salemanorderdetails', async (req, res) => {
  try {
    const year = new Date().getFullYear(); // 2025
    const results = [];
    const dailyMap = {}; // { "2025-01": { Akash: [0,0,...], Chandan: [...], ... } }

    for (const name of salesmen) {
      let monthlySales = Array(12).fill(0); // Jan to Dec

      const orders = await Order.find({
        salesmanName: name,
        orderDate: {
          $gte: new Date(`${year}-01-01T00:00:00.000Z`),
          $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
        },
      });

      orders.forEach((order) => {
        const date = new Date(order.orderDate);
        const month = date.getUTCMonth(); // 0–11
        const day = date.getUTCDate(); // 1–31

        const orderValue = order.cartItems.reduce((sum, item) => {
          return sum + item.rate * item.quantity;
        }, 0);

        monthlySales[month] += orderValue;

        const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`; // e.g., 2025-01

        if (!dailyMap[monthKey]) {
          dailyMap[monthKey] = {};
        }
        if (!dailyMap[monthKey][name]) {
          dailyMap[monthKey][name] = Array(31).fill(0);
        }

        dailyMap[monthKey][name][day - 1] += orderValue;
      });

      results.push({ name, monthlySales });
    }

    const monthOptions = Object.keys(dailyMap).sort(); // For dropdown

    res.render('salesman-cards', { results, year, dailyMap, monthOptions });
  } catch (error) {
    console.error('Error in monthly/daily sales:', error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
