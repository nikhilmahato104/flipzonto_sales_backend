const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SalesmanSchema = new mongoose.Schema({
    salesman_name: { type: String, required: true, unique: true }, // Unique name constraint
    password: { type: String, required: true }
});

// Hash password before saving
SalesmanSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('SalesmanAdmin', SalesmanSchema);





