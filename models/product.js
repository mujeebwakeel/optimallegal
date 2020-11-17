  var mongoose = require("mongoose");

  var productSchema = new mongoose.Schema({
        image: String,
        content: String,
        title: String
  })

  module.exports = mongoose.model("Product", productSchema);