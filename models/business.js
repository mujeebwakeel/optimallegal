var mongoose = require("mongoose");
var moment = require("moment");

var businessSchema = new mongoose.Schema({
    username: String,
    password: String,
    date: {type: String, default: moment().format("L")},
    name: String,
    nature: String,
    address: String, 
    email: String,
    contact: String,
    proprietor:
        {
            name: String,
            gender: String,
            nationality: String,
            address: String,
            date: String,
            email: String,
            phone: String,
            idType: String

        },
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