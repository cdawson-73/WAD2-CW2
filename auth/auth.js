const passport = require("passport");
const Strategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const userDAO = require("../models/userModel.js");
const userModel = new userDAO();

exports.init = function(app) {
    passport.use(new Strategy(
        function(username, password, cb) {
            userModel.lookup(username, function(err, username) {
                if (err) {
                    console.log("Error finding user.", err);
                    return cb(err);
                }
                if (!username) {
                    console.log("User ", username, " not found.");
                    return cb(null, false);
                }
                bcrypt.compare(password, username.password, function(err, result) {
                    if (result) {
                        cb(null, username);
                    } else {
                        cb(null, false);
                    }
                });
            });
        }
    ));
    passport.serializeUser(function(username, cb) {
        cb(null, username.username);
    });
    passport.deserializeUser(function(id, cb) {
        userModel.lookup(id, function(err, username) {
            if (err) {
                return cb(err);
            }
            cb(null, username);
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