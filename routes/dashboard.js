const express = require('express');
const router = express.Router();
const models = {
  Babycare: require('../models/Babycare'),
  BathingSoap: require('../models/BathingSoap'),
  Biscuit: require('../models/Biscuit'),
  Chocolate: require('../models/Chocolate'),
  ColdDrink: require('../models/ColdDrink'),
  DetergentBar: require('../models/DetergentBar'),
  DetergentPowder: require('../models/DetergentPowder'),
  Shampoo: require('../models/Shampoo'),
  Kirana: require('../models/Kirana'),
  Napkin: require('../models/Napkin'),
  Noodles: require('../models/Noodles'),
  Oil: require('../models/Oil'),
  PersonalCare: require('../models/PersonalCare'),
  Snack: require('../models/Snack'),
  Tea: require('../models/Tea'),
  Toothpaste: require('../models/Toothpaste'),
  Other: require('../models/Other'),
};

router.get('/admin-dashboard', async (req, res) => {
  let allData = [];
  let grandTotal = 0;
  let totalItems = 0;

  for (const [key, model] of Object.entries(models)) {
    const items = await model.find({});
    const categoryTotal = items.reduce((acc, item) => acc + (item.rate * item.available_jar), 0);
    const count = items.length;

    allData.push({
      category: key,
      count,
      totalValue: categoryTotal.toFixed(2)
    });

    totalItems += count;
    grandTotal += categoryTotal;
  }

  res.render('adminDashboard', {
    allData,
    totalItems,
    grandTotal: grandTotal.toFixed(2)
  });
});

module.exports = router;
