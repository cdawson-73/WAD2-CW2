//const wellbeingDAO = require("../models/wellbeingModel.js");
const userDAO = require("../models/userModel.js");
const user = new userDAO();
const auth = require("../auth/auth.js");
const {ensureLoggedIn} = require("connect-ensure-login");
//const db = new wellbeingDAO();
//db.init();

exports.show_guest_homepage = function(req, res) {
    res.render("guest/home"), {
        "title": "Wellbeing HQ",
    };
}

exports.show_user_homepage = function(req, res) {
    res.render("user/logged-in/home"), {
        "title": "Wellbeing HQ",
        "user": req.user
    };
}

exports.show_guest_about = function(req, res) {
    res.render("guest/about"), {
        "title": "About Us"
    };
};


exports.show_user_about = function(req, res) {
    res.render("user/logged-in/about"), {
        "title": "About Us",
        "user": req.user
    };
};

exports.show_guest_usefull = function(req, res) {
    res.render("guest/useful-links"), {
        "title": "Usefull Links"
    };
}

exports.show_user_usefull = function(req, res) {
    res.render("user/logged-in/useful-links"), {
        "title": "Usefull Links",
        "user": req.user
    };
}

exports.show_login = function(req, res) {
    res.render("user/login"), {
        "title": "Login"
    };
}

auth.authorize("/login");

exports.post_login = function(req, res) {
    console.log("User signed in.")
    res.redirect("/loggedIn");
   };

exports.show_signup = function(req, res) {
    res.render("user/register"), {
        "title": "Sign Up"
    };
}

exports.post_new_user = function(req, res) {
    const username = req.body.username;
    const password = req.body.pass;
    
    if (!username || !password) {
        res.sendStatus(401);
        console.log("No username or password entered")
        return;
    }
    user.lookup(username, function(err, u) {
    if (u) {
        res.sendStatus(401);
        console.log(username, "exists.")
        return;
    }
    user.create(username, password);
    console.log("Register", username, "with password", password);
    res.redirect('/login');
   });
}

exports.logout = function(req, res, next) {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }
        console.log("User signed out.")
        res.clearCookie('connect.sid', {
            path: "/",
            httpOnly: true,
        });
        res.redirect("/");
    });
}

exports.notFound = function(req, res) {
    res.render("not-found"), {
        "title": "Wellbeing HQ"
    };
}