const mongoose = require('mongoose');

const contributorSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  city: String,
  area: String,
  reason: String,
  approved: { type: Boolean, default: false },
});

module.exports = mongoose.model('Contributor', contributorSchema);
  