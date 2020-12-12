var express = require("express");
var router  = express.Router();
var User = require("../models/user");
var async = require("async");
var nodemailer = require("nodemailer");
var Mailgen = require("mailgen")
var smtpTransport = require("nodemailer-smtp-transport");


router.post('/forgot', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({email: req.body.email}, function(err, user) {
          if (err || !user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/user_login');
        }

        done(err,user);
      });
    },
    
    function(user, done) {
      var password = user.password;
      var name = user.username ;
      var transporter = nodemailer.createTransport({
        service: 'Yahoo', 
        secure: true,
        auth: {
          user: process.env.GMAIL_ADDRESS,
          pass: process.env.GMAIL_PASS
        }
      });

      let MailGenerator = new Mailgen({
        theme: "default",
        product: {
          name: "Nodemailer",
          link: "http://localhost:8000/",
        },
      });

      let response = {
        body: {
          name,
          intro: 'Your password is: ' + password ,
        },
      };
    
      let mail = MailGenerator.generate(response);
       

      var mailOptions = {
        to: user.email,
        from: process.env.GMAIL_ADDRESS,
        subject: 'Optimal Password Recovery ',
        html: mail
      };
      transporter.sendMail(mailOptions, function(err) {
        if(!err) {
          console.log('mail sent');
          req.flash('success', 'An e-mail has been sent to ' + user.email + ' with your password.');
        }
        
        done(err, user, 'done');
      });
    }
  ], function(err) {
    if (err) {
      console.log(err)
      req.flash("error", "E-mail not sent, kindly contact the admin via lekan@optimallegalpreneurs.com");
      return res.redirect('/user_login');
  }
  res.redirect('/user_login');
  });
});

module.exports = router;