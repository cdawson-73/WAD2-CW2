const user = require("../models/userModel.js");
const auth = require("../auth/auth.js");

exports.show_homepage = function(req, res) {
    res.render("guest/home", {
        "title": "Wellbeing HQ",
        "user": req.user,
    });
}

exports.show_about = function(req, res) {
    res.render("guest/about", {
        "title": "About Us",
        "user": req.user,
    });
};

exports.show_usefull = function(req, res) {
    res.render("guest/useful-links", {
        "title": "Usefull Links",
        "user": req.user,
    });
}

exports.show_login = function(req, res) {
    res.render("user/login", {
        "title": "Login"
    });
}

auth.authorize("/login");

exports.post_login = function(req, res) {
    console.log(req.user.username, "signed in.");
    
    res.redirect("/account");
   };

exports.show_signup = function(req, res) {
    res.render("user/register", {
        "title": "Sign Up"
    });
}

exports.post_new_user = function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    
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

exports.show_account = function(req, res) {
    res.render("user/logged-in/account", {
        "title": "Account",
        "user": req.user,
        "name": req.user.username,
    });
}

exports.show_achievements = function(req, res) {
    var username = req.user.username;
    var achievements = req.user.achievements;
    console.log(achievements.length);
    res.render("user/logged-in/achievements", {
        "title": "Achievements",
        "user": req.user,
        "name": username,
        "achievements": achievements,
    });
}

exports.show_new_goal = function(req, res) {
    res.render("user/logged-in/add-goal", {
        "title": "Add New Goal",
        "user": req.user,
    });
}

exports.post_new_goal = function(req, res) {
    const username = req.user.username;
    const name = req.body.name;
    const type = req.body.type;
    const repeat = req.body.repeat;
    const complete = "false";
    const dateCreated = Date.now();
    const dateSet = req.body.date;
    const dateComplete = "null";
    const description = req.body.description;
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);

    if (!name || !type || !repeat || !dateSet || !description) {
        res.sendStatus(401);
        console.log("All fields not complete.")
        return;
    }
    user.addGoal(username, name, type, repeat, complete, dateCreated, dateSet, dateComplete, description, id);
    res.redirect('/goals');
}

exports.show_goals = function(req, res) {
    var username = req.user.username;
    var goals = req.user.goals;
    res.render("user/logged-in/goals", {
        "title": "Goals",
        "user": req.user,
        "goals": req.user.goals,
    });
}

exports.logout = function(req, res, next) {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }
        console.log("User signed out.")
        res.redirect("/");
    });
}

exports.not_found = function(req, res) {
    res.render("guest/not-found", {
        "title": "Wellbeing HQ",
        "user": req.user,
    });
}