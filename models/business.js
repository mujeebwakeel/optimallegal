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
    phone: String,
    paymentref: String,
    amount: String,
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
    ]
})

module.exports = mongoose.model("Business", businessSchema);