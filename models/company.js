var mongoose = require("mongoose");
var moment = require("moment");

var companySchema = new mongoose.Schema({
    username: String,
    password: String,
    userEmail: String,
    date: {type: String, default: moment().format("L")},
    name: String,
    nature: String,
    address: String,
    shares: String,
    directors: [
        {
            name: String,
            gender: String,
            nationality: String,
            address: String,
            date: String,
            email: String,
            contact: String,
            allotment: String

        }
    ],
    identity: [
        {
            type: String
        }
    ],
    secretary: {
        name: String,
        gender: String,
        Nationality: String,
        address: String,
        date: String,
        email: String,
        contact: String
    },
    payment: [
        {
            amount: String,
            date: String
        } 
    ]
})

module.exports = mongoose.model("Company", companySchema);