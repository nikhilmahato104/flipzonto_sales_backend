const mongoose = require('mongoose');

const chocolateSchema = new mongoose.Schema({
  image: { type: String, required: true },
  name: { type: String, required: true },
  MRP: { type: Number, required: true },
  rate: { type: Number, required: true }, // 👈 new field added here
  total_weight: { type: String, required: true },
  available_jar: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Chocolate', chocolateSchema);
