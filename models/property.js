var mongoose = require("mongoose");
var moment = require("moment");

var propertySchema = new mongoose.Schema({
    description: String,
    price: Number,
    state: String,
    category: String,
    review: String,
    image: String,
    imageId: String,
    created: String
})

module.exports = mongoose.model("Property", propertySchema);