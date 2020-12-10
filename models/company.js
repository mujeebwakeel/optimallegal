var mongoose = require("mongoose");
var moment = require("moment");

var companySchema = new mongoose.Schema({
    username: String,
    password: String,
    date: {type: String, default: moment().format("L")},
    name: String,
    nature: String,
    address: String,
    share: String,
    paymentref: String,
    amount: String,
    director:
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

module.exports = mongoose.model("Company", companySchema);