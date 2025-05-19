const mongoose = require('mongoose');

const roundTwo = num => Math.round(num * 100) / 100;

const oilSchema = new mongoose.Schema({
  image: { type: String, required: true },
  name: { type: String, required: true },
  MRP: {
    type: Number,
    required: true,
    set: roundTwo
  },
  rate: {
    type: Number,
    required: true,
    set: roundTwo
  },
  total_weight: { type: String, required: true }, // e.g. "1L" or "500ml"
  available_jar: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Oil', oilSchema);
