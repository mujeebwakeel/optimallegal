var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    category: String,
    email: String,
    isAdmin: {type: Boolean, default: false},
    created: String,
    login: String,
    signature: String

});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);