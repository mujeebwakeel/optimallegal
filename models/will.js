var mongoose = require("mongoose");
var moment = require("moment");

var willSchema = new mongoose.Schema({
    username: String,
    password: String,
    date: {type: String, default: moment().format("L")},
    name: String,
    address: String,
    phone: String,
    email: String,
    content: String
    
})

module.exports = mongoose.model("Will", willSchema);