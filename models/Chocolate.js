// const mongoose = require('mongoose');

// const chocolateSchema = new mongoose.Schema({
//   image: { type: String, required: true },
//   name: { type: String, required: true },
//   MRP: { type: Number, required: true },
//   rate: { type: Number, required: true }, //  new field added here
//   total_weight: { type: String, required: true },
//   available_jar: { type: Number, required: true }
// }, { timestamps: true });

// module.exports = mongoose.model('Chocolate', chocolateSchema);
const mongoose = require('mongoose');

const roundTwo = num => Math.round(num * 100) / 100;

const chocolateSchema = new mongoose.Schema({
  image: { type: String, required: true },
  name: { type: String, required: true },
  MRP: {
    type: Number,
    required: true,
    set: roundTwo // 👈 This will round to 2 decimal places on save
  },
  rate: {
    type: Number,
    required: true,
    set: roundTwo // 👈 Also rounds here
  },
  total_weight: { type: String, required: true },
  available_jar: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Chocolate', chocolateSchema);
