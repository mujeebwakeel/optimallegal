var mongoose = require("mongoose");
var moment = require("moment");

var letterSchema = new mongoose.Schema({
    username: String,
    password: String,
    date: {type: String, default: moment().format("L")},
    name: String,
    address: String,
    phone: String,
    email: String,
    content: String,
    paymentref: String,
    amount: String
    
})

module.exports = mongoose.model("Letter", letterSchema);