// models/Category.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true } // You can use FontAwesome or image filename
});

module.exports = mongoose.model('Category', CategorySchema);
