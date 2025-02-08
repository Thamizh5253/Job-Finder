const mongoose = require("mongoose");

const AddLand = new mongoose.Schema({
  doc_image: { type: String, required: true },
  address: { type: String, required: true },
  initial_price: { type: Number, required: true },
  land_image: { type: String, required: true },
  city_name: { type: String, required: true },
  username: { type: String, required: true },

}, { timestamps: true });

module.exports = mongoose.model("AddLand", AddLand);
