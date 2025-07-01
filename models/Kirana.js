const mongoose = require('mongoose');

const roundTwo = num => Math.round(num * 100) / 100;

const kiranaSchema = new mongoose.Schema({
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
  total_weight: { type: String, required: true }, // e.g. "1kg", "500g"
  available_jar: { type: Number, required: true } // number of packets or jars
}, { timestamps: true });

module.exports = mongoose.model('Kirana', kiranaSchema);
