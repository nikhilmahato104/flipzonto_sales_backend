// routes/showallproductdetails.js
const express = require('express');
const router = express.Router();

const models = {
  Babycare: require('../models/Babycare'),
  // BathingSoap: require('../models/BathingSoap'),
  Biscuit: require('../models/Biscuit'),
  Chocolate: require('../models/Chocolate'),

  ColdDrink: require('../models/Colddrink'),
  

  DetergentBar: require('../models/DetergentBar'),
  DetergentPowder: require('../models/DetergentPowder'),
  Shampoo: require('../models/Shampoo'),
  Kirana: require('../models/Kirana'),
  Napkin: require('../models/Napkin'),
  Noodles: require('../models/Noodles'),
  Oil: require('../models/Oil'),
  PersonalCare: require('../models/Personalcare'),
  Snack: require('../models/Snack'),
  Tea: require('../models/Tea'),
  Toothpaste: require('../models/Toothpaste'),
  Other: require('../models/Other')
};

router.get('/showallproductdetails', async (req, res) => {
  try {
    const allProducts = [];
    let grandTotal = 0;

    for (const [category, model] of Object.entries(models)) {
      const items = await model.find({});
      items.forEach(item => {
        const total = item.rate * item.available_jar;
        grandTotal += total;
        allProducts.push({
          category,
          name: item.name,
          rate: item.rate.toFixed(2),
          quantity: item.available_jar,
          total: total.toFixed(2)
        });
      });
    }

    res.render('allProductDetails', { allProducts, grandTotal: grandTotal.toFixed(2) });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
