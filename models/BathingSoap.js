const mongoose = require('mongoose');

const roundTwo = num => Math.round(num * 100) / 100;

const bathingSoapSchema = new mongoose.Schema({
  image: { type: String, required: true },
  name: { type: String, required: true },
  MRP: {
    type: Number,
    required: true,
    set: roundTwo // Rounds to 2 decimal places on save
  },
  rate: {
    type: Number,
    required: true,
    set: roundTwo // Rounds to 2 decimal places on save
  },
  total_weight: { type: String, required: true },
  available_jar: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('BathingSoap', bathingSoapSchema);
