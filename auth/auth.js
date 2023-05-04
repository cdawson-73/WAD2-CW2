const passport = require("passport");
const Strategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel.js");

exports.init = function(app) {
    passport.use(new Strategy(
        function(username, password, cb) {
            userModel.lookup(username, function(err, user) {
                if (err) {
                    console.log("Error finding user.", err);
                    return cb(err);
                }
                if (!user) {
                    console.log("User ", username, " not found.");
                    return cb(null, false);
                }
                bcrypt.compare(password, user.password, function(err, result) {
                    if (result) {
                        cb(null, user);
                    } else {
                        cb(null, false);
                    }
                });
            });
        }
    ));
    passport.serializeUser(function(user, cb) {
        cb(null, user.username);
    });
    passport.deserializeUser(function(id, cb) {
        userModel.lookup(id, function(err, user) {
            if (err) {
                return cb(err);
            }
            cb(null, user);
        });
    });
    app.use(passport.initialize());
    app.use(passport.session());
}

exports.authorize = function(redirect) {
    return passport.authenticate("local", {
        failureRedirect: redirect
    });
}