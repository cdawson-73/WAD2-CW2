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
    var username = req.user.username;
    console.log(username, "signed in.");
    
    res.redirect("/"+ username +"/account");
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
    var username = req.user.username
    res.render("user/logged-in/account", {
        "title": "Account",
        "user": req.user,
        "username": username,
    });
}

exports.show_achievements = function(req, res) {
    var username = req.user.username;
    var achievements = Object.entries(req.user.achievements);
    var achieveData = new Array();
    for (var i = 0; i < achievements.length; i++) {
        achieveData.push(achievements[i][1])
    }
    res.render("user/logged-in/achievements", {
        "title": "Achievements",
        "user": req.user,
        "username": username,
        "achievements": achieveData,
    });
}

exports.show_achievement = function(req, res) {
    var username = req.user.username;
    var name  = req.params.name;
    var achievements = Object.entries(req.user.achievements);
    var achievement;
    for (var i = 0; i < achievements.length; i++) {
        if (achievements[i][1].name == name) {
            achievement = achievements[i][1];
        }
    }
    res.render("user/logged-in/achievement", {
        "title": username,
        "user": req.user,
        "username": username,
        "achievement": achievement,
    });
}

exports.show_new_goal = function(req, res) {
    var username = req.user.username;
    res.render("user/logged-in/add-goal", {
        "title": "Add New Goal",
        "user": req.user,
        "username": username,
    });
}

exports.post_new_goal = function(req, res) {
    var dateSet = req.body.date;
    dateSet =  Date.parse(dateSet);
    console.log(dateSet);
    const username = req.user.username;
    const name = req.body.name;
    const type = req.body.type;
    const complete = "false";
    const dateCreated = Math.round((Date.now() / 1000)) * 1000;
    //const dateSet = req.body.date;
    const dateComplete = "null";
    const description = req.body.description;
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);

    if (!name || !type || !dateSet || !description) {
        res.sendStatus(401);
        console.log("All fields not complete.")
        return;
    }
    user.addGoal(username, name, type, complete, dateCreated, dateSet, dateComplete, description, id);
    res.redirect("/" + username + "/goals");
}

exports.show_goals = function(req, res) {
    var username = req.user.username;
    var goals = Object.entries(req.user.goals);
    var setGoalData = new Array();
    var completeGoalData = new Array();
    for (var i = 0; i < goals.length; i++) {
        console.log(goals[i][1].complete);
        if (goals[i][1].complete == "true") {
            completeGoalData.push(goals[i][1]);
        } else {
            setGoalData.push(goals[i][1]);
        }
    }
    //console.log(setGoalData);
    //console.log(setGoalData[0].id);
    //console.log(completeGoalData);
    res.render("user/logged-in/goals", {
        "title": "Goals",
        "user": req.user,
        "username": username,
        "sGoals": setGoalData,
        "cGoals": completeGoalData,
    });
}

exports.show_goal = function(req, res) {
    var username = req.user.username;
    var id  = req.params.id;
    var goal = Object.entries(req.user.goals);
    var goalData;
    var sGoal;
    var cGoal;
    for (var i = 0; i < goal.length; i++) {
        console.log(goal[i][1].id);
        if (goal[i][1].id == id) {
            goalData = goal[i][1];
            if (goalData.complete == "true") {
                cGoal = goalData;
            } else {
                sGoal = goalData;
            }
            console.log(goalData);
        }
    }
    res.render("user/logged-in/goal", {
        "title": "Aye",
        "user": req.user,
        "username": username,
        "goal": goalData,
        "sGoal": sGoal,
        "cGoal": cGoal,
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