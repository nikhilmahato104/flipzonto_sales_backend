const mongoose = require('mongoose');

const roundTwo = num => Math.round(num * 100) / 100;

const napkinSchema = new mongoose.Schema({
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
  total_weight: { type: String, required: true }, // You can rename this if napkins use size instead
  available_jar: { type: Number, required: true } // You might rename this to "available_packs" for clarity
}, { timestamps: true });

module.exports = mongoose.model('Napkin', napkinSchema);
