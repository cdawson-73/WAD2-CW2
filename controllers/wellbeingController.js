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
    var earned;
    for (var i = 0; i < achievements.length; i++) {
        if (achievements[i][1].name == name) {
            achievement = achievements[i][1];
        }
    }
    if (achievement.dateAchieved == "null") {
        earned;
    } else {
        earned = "Earned: " + new Intl.DateTimeFormat("en-GB").format(achievement.dateAchieved)
    }

    res.render("user/logged-in/achievement", {
        "title": username,
        "user": req.user,
        "username": username,
        "achievement": achievement,
        "earned": earned,
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
    var username = req.user.username;
    var name = req.body.name;
    var type = req.body.type;
    var complete = "false";
    var dateCreated = Math.round((Date.now() / 1000)) * 1000;
    var dateSet = req.body.date;
    dateSet =  Date.parse(dateSet);
    var dateComplete = "null";
    var description = req.body.description;
    var id = Date.now().toString(36) + Math.random().toString(36).slice(2);

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
    var dateFormat;
    for (var i = 0; i < goals.length; i++) {
        if (goals[i][1].complete == "true") {
            dateFormat = goals[i][1].dateCreated;
            dateFormat = new Intl.DateTimeFormat("en-GB").format(dateFormat);
            goals[i][1].dateCreated = dateFormat;
            completeGoalData.push(goals[i][1]);
        } else {
            dateFormat = goals[i][1].dateCreated;
            dateFormat = new Intl.DateTimeFormat("en-GB").format(dateFormat);
            goals[i][1].dateCreated = dateFormat;
            setGoalData.push(goals[i][1]);
        }
    }
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
    var id = req.params.id;
    var goal = Object.entries(req.user.goals);
    var goalData;
    var sGoal;
    var sType;
    var sDateCreated;
    var sTargetDate;
    var cGoal;
    var cType;
    var cDateCreated;
    var cTargetDate;
    var cDateComplete;

    for (var i = 0; i < goal.length; i++) {
        if (goal[i][1].id == id) {
            goalData = goal[i][1];
            console.log(goalData);
            if (goalData.complete == "true") {
                cGoal = goalData;
                cDateComplete = new Intl.DateTimeFormat("en-GB").format(cGoal.dateComplete);
                if (goalData.type == "fitness") {
                    cType = "Fitness";
                } else if (goalData.type == "health") {
                    cType = "Healthy-Living";
                } else {
                    cType = "Nutrition";
                }
                
                cDateCreated = new Intl.DateTimeFormat("en-GB").format(cGoal.dateCreated);
                cTargetDate = new Intl.DateTimeFormat("en-GB").format(cGoal.dateSet);
            } else {
                sGoal = goalData;
                if (goalData.type == "fitness") {
                    sType = "Fitness";
                } else if (goalData.type == "health") {
                    sType = "Healthy-Living";
                } else {
                    sType = "Nutrition";
                }
                
                sDateCreated = new Intl.DateTimeFormat("en-GB").format(sGoal.dateCreated);
                sTargetDate = new Intl.DateTimeFormat("en-GB").format(sGoal.dateSet);
            }

            
        }
    }

    res.render("user/logged-in/goal", {
        "title": "Aye",
        "user": req.user,
        "username": username,
        "goal": goalData,
        "sGoal": sGoal,
        "sType": sType,
        "sDateCreated": sDateCreated,
        "sDateSet": sTargetDate,
        "cGoal": cGoal,
        "cType": cType,
        "cDateCreated": cDateCreated,
        "cDateSet": cTargetDate,
        "cDateComplete": cDateComplete,
    });
}

exports.show_edit_goal = function(req, res) {
    var username = req.user.username;
    var id = req.params.id;
    var goal = Object.entries(req.user.goals);
    var goalData;
    var fitness;
    var health;
    var nutrition;
    for (var i = 0; i < goal.length; i++) {
        if (goal[i][1].id == id) {
            goalData = goal[i][1];
            console.log(goalData.type);
            if (goalData.type == "fitness") {
                fitness = goalData.type
            } else if (goalData.type == "health") {
                health = goalData.type
            } else {
                nutrition = goalData.type
            }
        }
    }
    res.render("user/logged-in/edit-goal", {
        "title": "Edit Goal",
        "user": req.user,
        "username": username,
        "name": goalData.name,
        "fitness": fitness,
        "health": health,
        "nutrition": nutrition,
        "date": new Intl.DateTimeFormat("fr-CA", {year: "numeric", month: "2-digit", day: "2-digit"}).format(goalData.dateSet),
        "description": goalData.description,
        "id": id,
    });
}

exports.post_edit_goal = function(req, res) {
    var username = req.user.username;
    var id = req.params.id;
    var name = req.body.name;
    var type = req.body.type;
    var dateSet = req.body.date;
    dateSet =  Date.parse(dateSet);
    var description = req.body.description;

    if (!name || !type || !dateSet || !description) {
        res.sendStatus(401);
        console.log("All fields not complete.")
        return;
    }

    // Update function link here.

    res.redirect("/" + username + "/goal/" + id);
}

exports.show_complete_goal = function(req, res, next) {
    var username = req.user.username;
    var id = req.params.id;
    var goal = Object.entries(req.user.goals);
    var goalData;
    var createDateFormat;
    var setDateFormat;

    for (var i = 0; i < goal.length; i++) {
        if (goal[i][1].id == id) {
            goalData = goal[i][1];
            createDateFormat = goalData.dateCreated;
            setDateFormat = goalData.dateSet;
            createDateFormat = new Intl.DateTimeFormat("en-GB").format(createDateFormat);
            setDateFormat = new Intl.DateTimeFormat("en-GB").format(setDateFormat);
            goalData.dateCreated = createDateFormat;
            goalData.dateSet = setDateFormat;
        }
    }
    console.log(goalData);
    res.render("user/logged-in/complete-goal", {
        "title": "Complete Goal",
        "user": req.user,
        "username": username,
        "goal": goalData,
        "id": id,
    });
}

exports.post_complete_goal = function(req, res, next) {
    var username = req.user.username;
    var id = req.params.id;

    // Complete function link here.

    res.redirect("/" + username + "/goal/" + id);
}

exports.show_delete_goal = function(req, res, next) {
    var username = req.user.username;
    var id = req.params.id;
    var goal = Object.entries(req.user.goals);
    var goalData;
    var createDateFormat;
    var setDateFormat;

    for (var i = 0; i < goal.length; i++) {
        if (goal[i][1].id == id) {
            goalData = goal[i][1];
            createDateFormat = goalData.dateCreated;
            setDateFormat = goalData.dateSet;
            createDateFormat = new Intl.DateTimeFormat("en-GB").format(createDateFormat);
            setDateFormat = new Intl.DateTimeFormat("en-GB").format(setDateFormat);
            goalData.dateCreated = createDateFormat;
            goalData.dateSet = setDateFormat;
        }
    }
    console.log(goalData);
    res.render("user/logged-in/delete-goal", {
        "title": "Complete Goal",
        "user": req.user,
        "username": username,
        "goal": goalData,
        "id": id,
    });
}

exports.post_delete_goal = function(req, res, next) {
    var username = req.user.username;
    var id = req.params.id;

    // Delete function link here.
    
    res.redirect("/" + username + "/goals");
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