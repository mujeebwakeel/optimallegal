var mongoose = require("mongoose");
var moment = require("moment");

var paymentSchema = new mongoose.Schema({
    username: String,
    ref: String,
    type: String,
    date: String,
    amount: String
    
    
})

module.exports = mongoose.model("Payment", paymentSchema);