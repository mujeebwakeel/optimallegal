var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    category: String,
    email: String,
    isAdmin: {type: Boolean, default: false},
    created: String,
    login: String

});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);