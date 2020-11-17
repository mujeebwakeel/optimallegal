var mongoose = require("mongoose");
var moment = require("moment");

var businessSchema = new mongoose.Schema({
    username: String,
    password: String,
    userEmail: String,
    date: {type: String, default: moment().format("L")},
    name: String,
    object: String,
    address: String,
    email: String,
    contact: String,
    proprietors: [
        {
            name: String,
            address: String,
            date: String,
            email: String,
            contact: String

        }
    ],
    identity: [
        {
            type: String
        }
    ],
    payment: [
        {
            amount: Number,
            date: String
        } 
    ]
})

module.exports = mongoose.model("Business", businessSchema);