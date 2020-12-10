var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Business = require("../models/business");
var Company = require("../models/company");
var Incorporate = require("../models/incorporate");
var Letter = require("../models/letter");
var Will = require("../models/will");
var Property = require("../models/property");
var Payment = require("../models/payment");
var passport = require("passport");
var middleware = require("../middlewares");
var async = require("async");
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
var moment = require("moment");

  var multer = require('multer');
const letter = require("../models/letter");
  var storage = multer.diskStorage({
    filename: function(req, file, callback) {
      callback(null, Date.now() + file.originalname);
    }
  });
  var imageFilter = function (req, file, cb) {
      // accept image files only
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
          return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
  };
  var upload = multer({ storage: storage, fileFilter: imageFilter})
  
  var cloudinary = require('cloudinary').v2;
  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  



// HOMEPAGE
router.get("/", function(req,res) {
    Property.find({}, function(err, foundProduct) {
        if(err || !foundProduct) {
            req.flash('error', "No product exists for advert yet");
            return res.redirect('back');
        }
        res.render("index", {Property: foundProduct});
    })
})

// ADMIN ROUTES
router.get("/admin_login", function(req,res) {
    if(req.user) {
        req.flash("message", "You are currently logged in");
        return res.redirect("/admin_dashboard");
    }
    res.render("admin/adminlogin");
})

router.post("/admin_login", passport.authenticate("local", {
    successRedirect: "/admin_dashboard?q=in",
    failureFlash: true,
    failureRedirect: "/admin_login"
}), function(req,res){
});

router.get("/admin_dashboard", middleware.isAdmin, function(req,res) {
    if(req.query && req.query.q === "in") {
        User.findOne({username: req.user.username}, function(err, user) {
            if(err || !user) {
                req.flash("error", "Query not revelant");
                return res.redirect("/");
            }
            user.login = moment().format("lll");
            user.save(function(err, savedUser) {
                res.render("admin/admindashboard")
            })
        }) 
    } else {
        res.render("admin/admindashboard")
    }
});

router.get("/admin_manageuser", middleware.isAdmin, function(req,res) {
    User.find({}, function(err, foundUsers) {
        if(err || !foundUsers) {
            req.flash("error", "Users not found");
            return res.redirect("/admin_dashboard");
        }
        var users = [];
        foundUsers.forEach(function(user) {
            if(user.category) {
                users.push(user);
            }
        })
        res.render("admin/manageuser", {users: users})
    })
});

router.get("/admin_payment", middleware.isAdmin, function(req,res) {
    Payment.find({}, function(err, foundPayments) {
        if(err || !foundPayments) {
            req.flash("error", "Payment Not Found");
                return res.redirect("/admin_dashboard");
        }
        res.render("admin/payment", {payments: foundPayments})
    })
})

router.get("/admin_uploadproperty", middleware.isAdmin, function(req,res) {
    res.render("admin/uploadproperty")
})

router.post("/admin_uploadproperty", middleware.isAdmin, upload.single('image'), function(req,res) {
    cloudinary.uploader.upload(req.file.path, function(err,result) { 
        if(err){
            console.log(err);
            return res.redirect("back");
        }
   // add cloudinary url for the image to the property object under image property
 
   var property = req.body.property;
   property.image = result.secure_url;
   property.imageId = result.public_id;
   
   // add created to property
   property.created = moment().format("L");  
   Property.create(property, function(err, property) {
     if (err) {
        console.log(err);
       req.flash('error', err.message);
       return res.redirect('back');
     }
     req.flash("success", "You successfully uploaded a property");
     res.redirect('/admin_uploadproperty');
   });
 });
})

router.get("/admin_userprofile",  middleware.isAdmin, function(req,res) {
    if(req.query.q) {
        Business.find({username: req.query.q}, function(err, foundBusiness) {
            if(err) {
                req.flash("error", "Something went wrong while resolving business detail");
                return res.redirect("/admin_manageuser");        
            }
            Company.find({username: req.query.q}, function(err, foundCompany) {
                if(err) {
                    req.flash("error", "Something went wrong while resolving company detail");
                    return res.redirect("/admin_manageuser");
                }
            Incorporate.find({username: req.query.q}, function(err, foundIncorporate) {
                if(err) {
                    req.flash("error", "Something went wrong while resolving incorporate detail");
                    return res.redirect("/admin_manageuser");
                }
            Letter.find({username: req.query.q}, function(err, foundLetter) {
                if(err) {
                    req.flash("error", "Something went wrong while resolving letter detail");
                    return res.redirect("/admin_manageuser");
                }
            Will.find({username: req.query.q}, function(err, foundWill) {
                if(err) {
                    req.flash("error", "Something went wrong while resolving will detail");
                    return res.redirect("/admin_manageuser");
                }
                User.findOne({username: req.query.q}, function(err, user) {
                    if(err) {
                        req.flash("error", "User not found");
                        return res.redirect("/admin_manageuser");
                    }
                    return res.render("admin/userprofile", {business: foundBusiness, company: foundCompany, incorporate: foundIncorporate, letter: foundLetter, will: foundWill, user: user});
                })
            })
           })
          })
         })
        })
    } else {
        res.redirect("/admin_manageuser");
    }
})

router.get("/products_list", middleware.isAdmin, function(req,res) {
    Property.find({}, function(err, found) {
        if(err || !found) {
            req.flash('error', "Something went wrong while compiling advert");
            return res.redirect('back');
        }
        res.render("admin/productlist", {products: found})
    })
})

router.get("/delete/:id", middleware.isAdmin, function(req,res) {
        Property.findById(req.params.id, function(err, found) {
        if(err || !found) {
            req.flash('error', "Product not found for deletion");
            return res.redirect("/products_list");
        }
        Property.deleteOne({_id: found._id}, function(err) {
            if(err) {
                req.flash('error', "Something went wrong during deletion");
                return res.redirect("/products_list");
            }
                req.flash('success', "You successfully deleted an advert");
                return res.redirect("/products_list");
        })
    })
});

router.get("/products_advert", function(req,res) {
    Property.find({}, function(err, foundProduct) {
        if(err || !foundProduct) {
            req.flash('error', "No product exists for advert yet");
            return res.redirect('back');
        }
        res.render("advert", {Product: foundProduct});
    })
})


// USER AUTH ROUTES
router.get("/user_signup", function(req,res){
    if(req.user) {
        req.flash("message", "You are currently logged in");
        return res.redirect("/dashboard");
    }
    res.render("signup");
});

router.post("/user_signup", function(req,res){
             var newUser = new User({ 
                                      username: req.body.username,
                                      password: req.body.password,
                                      email: req.body.email,
                                      created: moment().format("L")
                                });
   User.register(newUser, req.body.password, function(err,user){
       if(err || !user){
           req.flash("error", err.message);
           return res.redirect("/user_signup");
       }
       passport.authenticate("local")(req,res, function(){        
            res.redirect("/dashboard?q=in");
       });
    }); 
});


// USER LOGIN ROUTES
router.get("/user_login", function(req,res){
    if(req.user) {
        req.flash("message", "You are currently logged in");
        return res.redirect("/dashboard");
    }
    res.render("login");
});

router.post("/user_login", passport.authenticate("local", {
    successRedirect: "/dashboard?q=in",
    failureFlash: true,
    failureRedirect: "/user_login"
}), function(req,res){
});


// REGISTRATION
router.get("/business", middleware.isUserLoggedIn, function(req, res) {
    res.render("business");
}); 

router.post("/business", middleware.isUserLoggedIn, upload.array('image'), function(req,res) {
    User.findOne({username: req.user.username}, function(err, foundUser) {
        Business.create(req.body.business, async function(err, createdBusiness) {
            if(err || !createdBusiness) {
                req.flash("error", "something went wrong while creating business");
                return res.redirect("/business");
            }
            var payment = await {
                username: foundUser.username,
                ref: req.body.business.paymentref,
                type: "Business Registration",
                date: moment().format("L"),
                amount: "37"
            }
            Payment.create(payment, function(err, createdPayment) {
                if(err || !createdPayment) {
                    req.flash("error", "something went wrong while creating payment for business");
                return res.redirect("/business");
                }
                foundUser.category = "business";
                foundUser.save();
                createdBusiness.username = foundUser.username;
                createdBusiness.amount = "37";
                createdBusiness.password = foundUser.password;
                createdBusiness.proprietor = req.body.proprietor;
                var bar = new Promise((resolve, reject) => {
                    req.files.forEach(async (photo, index, array) => {
                        cloudinary.uploader.upload(photo.path, async function(err,result) {
                            if(err){
                                req.flash("err", err.message);
                                return res.redirect("back");
                            }
                            await createdBusiness.identity.push(result.secure_url);
                            if (createdBusiness.identity.length === array.length) {
                                createdBusiness.save(function() {
                                    resolve();
                                })
                            }                    
                        });
                    });
                });
                bar.then(() => {
                        req.flash("success", "Your business was created and saved successfully.");
                        res.redirect("/dashboard");
                });
            })
        })    
    })
});

router.get("/deLawProfile", middleware.isUserLoggedIn, function(req,res) {
    res.render("deLawProfile")
})

router.get("/company", middleware.isUserLoggedIn, function(req,res) {
    res.render("company");
});

router.post("/company", middleware.isUserLoggedIn, upload.array('image'), function(req,res) {
    User.findOne({username: req.user.username}, function(error, foundUser) {
        Company.create(req.body.company, async function(err, createdCompany) {
            if(err || !createdCompany) {
                req.flash("error", "something went wrong while creating company");
                return res.redirect("/company");
            }
            var payment = await {
                username: foundUser.username,
                ref: req.body.company.paymentref,
                type: "Company Registration",
                date: moment().format("L"),
                amount: "50"
            }
            Payment.create(payment, function(err, createdPayment) {
                if(err || !createdPayment) {
                    req.flash("error", "something went wrong while creating payment for company");
                return res.redirect("/company");
                }
                foundUser.category = "company";
                foundUser.save();
                createdCompany.username = foundUser.username;
                createdCompany.amount = "50";
                createdCompany.password = foundUser.password;
                createdCompany.secretary = req.body.secretary;
                createdCompany.director = req.body.director;
                var bar = new Promise((resolve, reject) => {
                    req.files.forEach(async (photo, index, array) => {
                        cloudinary.uploader.upload(photo.path, async function(err,result) {
                            if(err){
                                req.flash("err", err.message);
                                return res.redirect("back");
                            }
                            await createdCompany.identity.push(result.secure_url);
                            if (createdCompany.identity.length === array.length) {
                                createdCompany.save(function() {
                                    resolve();
                                })
                            }                    
                        });
                    });
                });
                
                bar.then(() => {
                        req.flash("success", "Your company was created and saved successfully.");
                        res.redirect("/dashboard");
                });    
            })
        })    
    })
});

router.get("/incorporate", middleware.isUserLoggedIn, function(req,res) {
    res.render("incorporateTrustees")
})

router.post("/incorporate", middleware.isUserLoggedIn, upload.array('image'), function(req,res) {
    User.findOne({username: req.user.username}, function(error, foundUser) {
        Incorporate.create(req.body.incorporate, async function(err, createdIncorporate) {
            if(err || !createdIncorporate) {
                req.flash("error", "something went wrong while creating incorporate");
                return res.redirect("/incorporate");
            }
            var payment = await {
                username: foundUser.username,
                ref: req.body.incorporate.paymentref,
                type: "Incorporate Registration",
                date: moment().format("L"),
                amount: "30"
            }
            Payment.create(payment, function(err, createdPayment) {
                if(err || !createdPayment) {
                    req.flash("error", "something went wrong while creating payment for Incorporate");
                return res.redirect("/incorporate");
                }
                foundUser.category = "incorporate";
                foundUser.save();
                createdIncorporate.username = foundUser.username;
                createdIncorporate.amount = "30";
                createdIncorporate.password = foundUser.password;
                createdIncorporate.secretary = req.body.secretary;
                createdIncorporate.trustee = req.body.trustee;
                createdIncorporate.chairman = req.body.chairman;
                var bar = new Promise((resolve, reject) => {
                    req.files.forEach(async (photo, index, array) => {
                        cloudinary.uploader.upload(photo.path, async function(err,result) {
                            if(err){
                                req.flash("err", err.message);
                                return res.redirect("back");
                            }
                            await createdIncorporate.identity.push(result.secure_url);
                            if (createdIncorporate.identity.length === array.length) {
                                createdIncorporate.save(function() {
                                    resolve();
                                })
                            }                    
                        });
                    });
                });
                
                bar.then(() => {
                        req.flash("success", "Your incorporate and trustee was created and saved successfully.");
                        res.redirect("/dashboard");
                }); 
            })
        })    
    })
});

router.get("/will", middleware.isUserLoggedIn, function(req,res) {
    res.render("willAndTestament");
});

router.post("/will", middleware.isUserLoggedIn, function(req,res) {
    User.findOne({username:req.user.username}, function(error, foundUser) {
        Will.create(req.body.will, async function(error, createdWill) {
            if(error || !createdWill) {
                req.flash("error", "something went wrong while submitting will");
                return res.redirect("/will");
            } 
            var payment = await {
                username: foundUser.username,
                ref: req.body.will.paymentref,
                type: "Will and Testament",
                date: moment().format("L"),
                amount: "37"
            }
            Payment.create(payment, function(err, createdPayment) {
                if(err || !createdPayment) {
                    req.flash("error", "something went wrong while creating payment for will and testament");
                return res.redirect("/will");
                }
                foundUser.category = "will";
                foundUser.save();
                createdWill.username = foundUser.username;
                createdWill.password = foundUser.password;
                createdWill.amount = "37";
    
                createdWill.save(function(error, savedWill) {
                    if(error || !savedWill) { 
                        req.flash("error", "something went wrong while saving will");
                        return res.redirect("/will");
                    }
                    req.flash("success", "Your will and testament was submitted successfully");
                    return res.redirect("/dashboard");
                })

            })
        })
    })
})

router.get("/letter", middleware.isUserLoggedIn, function(req,res) {
    res.render("letterOfAdministration")
})

router.post("/letter", middleware.isUserLoggedIn, function(req,res) {
    User.findOne({username:req.user.username}, function(error, foundUser) {
        Letter.create(req.body.letter, async function(error, createdLetter) {
            if(error || !createdLetter) {
                req.flash("error", "something went wrong while submitting letter");
                return res.redirect("/letter");
            } 
            var payment = await {
                username: foundUser.username,
                ref: req.body.letter.paymentref,
                type: "Letter of Administration",
                date: moment().format("L"),
                amount: "20"
            }
            Payment.create(payment, function(err, createdPayment) {
                if(err || !createdPayment) {
                    req.flash("error", "something went wrong while creating payment for Letter of Administration");
                return res.redirect("/letter");
                }
                foundUser.category = "letter";
                foundUser.save();
                createdLetter.username = foundUser.username;
                createdLetter.amount = "20";
                createdLetter.password = foundUser.password;
    
                createdLetter.save(function(error, savedLetter) {
                    if(error || !savedLetter) {
                        req.flash("error", "something went wrong while saving letter");
                        return res.redirect("/letter");
                    }
                    req.flash("success", "Your letter of administration was submitted successfully");
                    return res.redirect("/dashboard");
                })
            })
        })
    })
})

router.get("/dashboard", middleware.isUserLoggedIn, function(req,res) {
    if(req.query && req.query.q === "in") {
        User.findOne({username: req.user.username}, function(err, user) {
            if(err || !user) {
                req.flash("error", "Query not revelant");
                return res.redirect("/");
            }
            user.login = moment().format("lll");
            user.save(function(err, savedUser) {
                res.render("dashboard")
            })
        })
    } else {
        res.render("dashboard")
    }
})

router.get("/payment", middleware.isUserLoggedIn, function(req,res) {
    res.render("payment");
});

// router.get("/admin_clients", middleware.isAdmin, function(req,res) {
//     Business.find({}, function(err, foundBusiness) {
//         if(err) {
//             req.flash("error", "Something went wrong while resolving business list");
//             return res.redirect("/");
//         }
//         Company.find({}, function(err, foundCompany) {
//             if(err) {
//                 req.flash("error", "Something went wrong while resolving company list");
//                 return res.redirect("/");
//             }
//             res.render("clients", {business: foundBusiness, company: foundCompany});
//         })
//     })
// })

// router.get("/moredetail", middleware.isAdmin, function(req,res) {
//     Business.findById(req.query.q, function(err, foundBusiness) {
//         if(err) {
//             req.flash("error", "Something went wrong while resolving business detail");
//             return res.redirect("/");        
//         }
//         Company.findById(req.query.q, function(err, foundCompany) {
//             if(err) {
//                 req.flash("error", "Something went wrong while resolving company detail");
//                 return res.redirect("/");
//             }
//             if(!foundBusiness && !foundCompany) {
//                 req.flash("error", "The seacrhed business/company does not exist on this website");
//                 return res.redirect("/");
//             }
//             var organization = foundBusiness || foundCompany
//             res.render("moredetail", {organization: organization});
//         })
//     })
// })

// router.get("/payment", function(req,res) {
//     res.render("payment");
// });

// router.post("/payment", middleware.isAdmin, function(req,res) {
//     Business.findById(req.query.q, function(err, foundBusiness) {
//         if(err) {
//             req.flash("error", "Something went wrong while searching for business");
//             return res.redirect("/");
//         }
//         Company.findById(req.query.q, async function(err, foundCompany) {
//             if(err) {
//                 req.flash("error", "Something went wrong while searching for company");
//                 return res.redirect("/");
//             }
//             var found = foundBusiness || foundCompany ;
//             var payment = await {
//                 amount: req.body.amount,
//                 date: moment().format("L")
//             }
//             await found.payment.unshift(payment);
//             found.save(function(err, savedFound) {
//                 if(err) {
//                     req.flash("error", "Something went wrong while updating payment");
//                     return res.redirect("/moredetail?q=" + found._id);
//                 }
//                 req.flash("success", "You successfully updated payment for this organization");
//                 return res.redirect("/moredetail?q=" + found._id);
//             })
//         })
//     })
// })

// router.get("/profile", function(req,res) {
//     Business.findOne({username:req.query.q}, function(err, foundBusiness) {
//         if(err) {
//             req.flash("error", "Something went wrong while resolving business detail");
//             return res.redirect("/");        
//         }
//         Company.findOne({username:req.query.q}, function(err, foundCompany) {
//             if(err) {
//                 req.flash("error", "Something went wrong while resolving company detail");
//                 return res.redirect("/");
//             }
//             if(!foundBusiness && !foundCompany) {
//                 req.flash("error", "You currently do not have any business/company registered with us");
//                 return res.redirect("/");
//             }
//             var organization = foundBusiness || foundCompany
//             res.render("moredetail", {organization: organization});
//         })
//     })
// })

// router.get("/admin_products", middleware.isAdmin, function(req,res) {
//     res.render("product");
// })

// router.post("/admin_products", middleware.isAdmin, upload.single('image'), function(req,res) {
//     cloudinary.uploader.upload(req.file.path, async function(err,result) { 
//         if(err){
//             req.flash("err", err.message);
//             return res.redirect("back");
//         }
//    // add cloudinary url for the image to the product object under image property
 
//    var product = req.body.product;
//         product.image = result.secure_url;

//    Product.create(product, function(err, product) {
//      if (err) {
//        req.flash('error', "Something went wrong while creating product");
//        return res.redirect('back');
//      }
//      console.log(product);
//      req.flash('success', "Product was created succesfully");
//      res.redirect('/');
//    });
//  });
// });


router.get("/all", function(req,res) {
    User.find({}, function(err, found) {
        if(err || !found) {
            res.send("error occurred");
        }
            res.send(found);
    })
})

// LOG OUT ROUTE
router.get("/admin_logout", function(req,res){
    req.logout();
    res.redirect("/admin_login");
});

router.get("/logout", function(req,res){
    req.logout();
    res.redirect("/");
});

module.exports = router;