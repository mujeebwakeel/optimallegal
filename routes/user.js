var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Business = require("../models/business");
var Company = require("../models/company");
var Incorporate = require("../models/incorporate");
var Letter = require("../models/letter");
var Will = require("../models/will");
var passport = require("passport");
var middleware = require("../middlewares");
var async = require("async");
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
var moment = require("moment");

  var multer = require('multer');
const { isUserLoggedIn } = require("../middlewares");
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
    res.render("index");
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
                                });
   User.register(newUser, req.body.password, function(err,user){
       if(err || !user){
           console.log(err.message);
           req.flash("error", err.message);
           return res.redirect("/user_signup");
       }
       passport.authenticate("local")(req,res, function(){
           req.flash("success", "You are signed in");
            res.redirect("/dashboard");
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
    successFlash: "You are now logged in!",
    successRedirect: "/dashboard",
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
        Business.create(req.body.business, function(err, createdBusiness) {
            if(err || !createdBusiness) {
                req.flash("error", "something went wrong while creating business");
                return res.redirect("/business");
            }
            createdBusiness.username = foundUser.username;
            createdBusiness.password = foundUser.password;
            createdBusiness.proprietor = req.body.proprietor;
            var bar = new Promise((resolve, reject) => {
                req.files.forEach(async (photo, index, array) => {
                    var result = await cloudinary.uploader.upload(photo.path);
                        await createdBusiness.identity.push(result.secure_url);
                        await createdBusiness.save()
                    if (index === array.length -1) resolve();
                });
            });
            bar.then(() => {
                    req.flash("success", "Your business was created and saved successfully.");
                    console.log('All done!');
                    res.redirect("/");
            });    
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
        Company.create(req.body.company, function(err, createdCompany) {
            if(err || !createdCompany) {
                req.flash("error", "something went wrong while creating company");
                return res.redirect("/company");
            }
            createdCompany.username = foundUser.username;
            createdCompany.password = foundUser.password;
            createdCompany.secretary = req.body.secretary;
            createdCompany.director = req.body.director;
            var bar = new Promise((resolve, reject) => {
                req.files.forEach(async (photo, index, array) => {
                    var result = await cloudinary.uploader.upload(photo.path);
                        await createdCompany.identity.push(result.secure_url);
                        await createdCompany.save()
                    if (index === array.length -1) resolve();
                });
            });
            
            bar.then(() => {
                    req.flash("success", "Your company was created and saved successfully.");
                    console.log('All done!');
                    res.redirect("/");
            });    
        })    
    })
});

router.get("/incorporate", middleware.isUserLoggedIn, function(req,res) {
    res.render("incorporateTrustees")
})

router.post("/incorporate", middleware.isUserLoggedIn, upload.array('image'), function(req,res) {
    User.findOne({username: req.user.username}, function(error, foundUser) {
        Incorporate.create(req.body.incorporate, function(err, createdIncorporate) {
            if(err || !createdIncorporate) {
                req.flash("error", "something went wrong while creating incorporate");
                return res.redirect("/");
            }
            createdIncorporate.username = foundUser.username;
            createdIncorporate.password = foundUser.password;
            createdIncorporate.secretary = req.body.secretary;
            createdIncorporate.trustee = req.body.trustee;
            createdIncorporate.chairman = req.body.chairman;
            var bar = new Promise((resolve, reject) => {
                console.log(req.files);
                req.files.forEach(async (photo, index, array) => {
                    var result = await cloudinary.uploader.upload(photo.path);
                        await createdIncorporate.identity.push(result.secure_url);
                        await createdIncorporate.save()
                    if (index === array.length -1) resolve();
                });
            });
            
            bar.then(() => {
                    req.flash("success", "Your incorporate and trustee was created and saved successfully.");
                    console.log('All done!');
                    res.redirect("/");
            });    
        })    
    })
});

router.get("/will", middleware.isUserLoggedIn, function(req,res) {
    res.render("willAndTestament");
});

router.post("/will", middleware.isUserLoggedIn, function(req,res) {
    User.findOne({username:req.user.username}, function(error, foundUser) {
        Will.create(req.body.will, function(error, createdWill) {
            if(error || !createdWill) {
                req.flash("error", "something went wrong while submitting will");
                return res.redirect("/will");
            } 
            createdWill.username = foundUser.username;
            createdWill.password = foundUser.password;

            createdWill.save(function(error, savedWill) {
                if(error || !savedWill) {
                    req.flash("error", "something went wrong while saving will");
                    return res.redirect("/will");
                }
                req.flash("success", "Your will and testament was submitted successfully");
                return res.redirect("/");
            })
        })
    })
})

router.get("/letter", middleware.isUserLoggedIn, function(req,res) {
    res.render("letterOfAdministration")
})

router.post("/letter", middleware.isUserLoggedIn, function(req,res) {
    User.findOne({username:req.user.username}, function(error, foundUser) {
        Letter.create(req.body.letter, function(error, createdLetter) {
            if(error || !createdLetter) {
                req.flash("error", "something went wrong while submitting letter");
                return res.redirect("/letter");
            } 
            console.log(req.body.name);
            createdLetter.username = foundUser.username;
            createdLetter.password = foundUser.password;

            createdLetter.save(function(error, savedLetter) {
                if(error || !savedLetter) {
                    req.flash("error", "something went wrong while saving letter");
                    return res.redirect("/letter");
                }
                req.flash("success", "Your letter of administration was submitted successfully");
                return res.redirect("/");
            })
        })
    })
})

router.get("/dashboard", middleware.isUserLoggedIn, function(req,res) {
    res.render("dashboard")
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

// router.get("/products_advert", function(req,res) {
//     Product.find({}, function(err, foundProduct) {
//         if(err || !foundProduct) {
//             req.flash('error', "No product exists for advert yet");
//             return res.redirect('back');
//         }
//         res.render("advert", {products: foundProduct});
//     })
// })

// router.get("/products_list", middleware.isAdmin, function(req,res) {
//     Product.find({}, function(err, found) {
//         if(err || !found) {
//             req.flash('error', "Something went wrong while compiling advert");
//             return res.redirect('back');
//         }
//         res.render("productList", {products: found})
//     })
// })

// router.get("/delete/:id", middleware.isAdmin, function(req,res) {
//     Product.findById(req.params.id, function(err, found) {
//         if(err || !found) {
//             req.flash('error', "Product not found for deletion");
//             return res.redirect("/products_list");
//         }
//         Product.deleteOne({_id: found._id}, function(err) {
//             if(err) {
//                 req.flash('error', "Something went wrong during deletion");
//                 return res.redirect("/products_list");
//             }
//                 req.flash('success', "You successfully deleted an advert");
//                 return res.redirect("/products_list");
//         })
//     })
// })

router.get("/all", function(req,res) {
    Incorporate.find({}, function(err, found) {

        res.send(found);
    })
})

// LOG OUT ROUTE
router.get("/logout", function(req,res){
    req.logout();
    req.flash("success", "You are signed out");
    res.redirect("/");
});


module.exports = router;