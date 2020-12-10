var mongoose = require("mongoose");
var moment = require("moment");

var incorporateSchema = new mongoose.Schema({
    username: String,
    password: String,
    date: {type: String, default: moment().format("L")},
    name: String,
    nature: String,
    address: String,
    mode: String,
    paymentref: String,
    amount: String,
    trustee:
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
    chairman:
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
    secretary: {
        name: String,
        gender: String,
        nationality: String, 
        address: String, 
        date: String,
        email: String,
        phone: String,
        idType: String
    }
})

module.exports = mongoose.model("Incorporate", incorporateSchema);