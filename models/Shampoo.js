const mongoose = require('mongoose');

const roundTwo = num => Math.round(num * 100) / 100;

const shampooSchema = new mongoose.Schema({
  image: { type: String, required: true },
  name: { type: String, required: true },
  MRP: {
    type: Number,
    required: true,
    set: roundTwo // Rounds to 2 decimal places
  },
  rate: {
    type: Number,
    required: true,
    set: roundTwo // Rounds to 2 decimal places
  },
  total_volume: { type: String, required: true }, // e.g. "500ml"
  available_jar: { type: Number, required: true } // number of jars/bottles
}, { timestamps: true });

module.exports = mongoose.model('Shampoo', shampooSchema);
