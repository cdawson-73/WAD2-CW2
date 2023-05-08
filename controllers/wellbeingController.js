const user = require("../models/userModel.js");
const auth = require("../auth/auth.js");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../utils/sendEmail.js");

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

//auth.authorize("/login");

exports.post_login = function(req, res) {
    var username = req.user.username;
    console.log(username, "signed in.");
    
    res.redirect("/"+ username +"/dashboard");
   };

exports.show_signup = function(req, res) {
    res.render("user/register", {
        "title": "Sign Up"
    });
}

exports.show_forgot_password = function(req, res) {
    res.render("user/forgot-password", {
        "title": "Forgot Password"
    });
}

exports.post_forgot_password = function(req, res) {
    var email = req.body.email;
    var subject = "Password Reset Request";

    user.lookupEmail(email, function(err, u) {
        if (!u) {
            console.log("This email is not registered.");
            return;
        }

        user.getDetails(email).then((data) => {
            var username = data[0].username;
            var password = data[0].password;
            var link;
            var content;
            var resetHash = user.passwordResetHash(password);
            link = "http://localhost:3000/new-password?email=" + email + "&key=" + resetHash;
            content = username + " you requested to reset your password. <a href='" + link + "'>Click this link to reset your password.</a>";
            sendEmail(email, subject, content);
            res.redirect('/login');
        });
    }); 
}

exports.show_new_password = function(req, res) {
    var email = req.query.email;
    var hash = req.query.key;

    user.getDetails(email).then((data) => {
        user.lookupEmail(email, function(err, u) {
            if (!u) {
                console.log("Invalid email.");
                return;
            } else if (!user.verifyPasswordResetHash(data[0].password, hash)) {
                console.log("Invalid key.");
                return;
            }
            res.render("user/reset-password", {
                "title": "Reset Password"
            });
        });
    });
}

exports.post_new_password = function(req, res) {
    var email = req.query.email;
    var newPassword = req.body.newPassword;
    var conPassword = req.body.conPassword;

    if (!newPassword || !conPassword) {
        console.log("You need to fill out all of the fields.")
        return;
    } else if (newPassword != conPassword) {
        console.log("Passwords don't match.")
        return;
    } else{
        user.getDetails(email).then((data) => {
            var username = data[0].username;
            user.updatePassword(username, newPassword);
            res.redirect("/login"); 
        });
    }
}

exports.post_new_user = function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const conPassword = req.body.confirmPassword;
    
    if (!username || !password || !email || !firstName || !lastName) {
        console.log("You need to fill out all of the fields.")
        return;
    } else if (password != conPassword) {
        console.log("Passwords don't match.")
        return;
    } else if (email == process.env.USER) {
        console.log("This email is unavailable.")
        return;
    }

    user.lookupUser(username, function(err, u) {
        if (u) {
            console.log(username, "exists.")
            return;
        }

        user.lookupEmail(email, function(err, u) {
            if (u) {
                console.log(email, "exists.")
                return;
            }
            
            user.create(username, password, email, firstName, lastName);
            console.log("Register", username, "with password", password);
            res.redirect('/login');
        });
   });
}

exports.show_dashboard = function(req, res) {
    var username = req.user.username;
    var firstName = req.user.firstName;
    res.render("user/logged-in/dashboard", {
        "title": "Dashboard",
        "user": req.user,
        "username": username,
        "firstName": firstName,
    });
}

exports.show_account = function(req, res) {
    var firstName = req.user.firstName;
    
    res.render("user/logged-in/account", {
        "title": "Account",
        "user": req.user,
        "firstName": firstName,
    });
    
    
}

exports.show_account_edit = function(req, res) {
    var username = req.user.username;
    var firstName = req.user.firstName;
    
    
    res.render("user/logged-in/edit-account", {
        "title": "Account",
        "user": req.user,
        "firstName": firstName,
    });
}

exports.post_account_edit = function(req, res) {
    var username = req.user.username;
    var email = req.body.email;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var password = req.body.password;

    if (!username || !email || !firstName || !lastName) {
        console.log("You need to fill out all of the fields.")
        return;
    } else if (!password) {
        console.log("You need to enter your password to update your account.")
        return;
    } else if (email == process.env.USER) {
        console.log("This email is unavailable.")
        return;
    } else if (!bcrypt.compareSync(password, req.user.password)) {
        console.log("Password incorrect.")
        return;
    } else {
        if (email != req.user.email) {
            user.lookupEmail(email, function(err, u) {
                if (u) {
                    console.log(email, "exists.")
                    return;
                }
                    user.update(username, email, firstName, lastName);
                    console.log("Update", username, "details");
                    res.redirect("/" + username + "/account");
           });
        } else {
            user.update(username, email, firstName, lastName);
            console.log("Update", username, "details");
            res.redirect("/" + username + "/account");
        }
    }
}

exports.show_password_edit = function(req, res) {
    var firstName = req.user.firstName;
    
    res.render("user/logged-in/edit-password", {
        "title": "Account",
        "user": req.user,
        "firstName": firstName,
    });
}

exports.post_password_edit = function(req, res) {
    var username = req.user.username;
    var currentPassword = req.body.currentPassword;
    var newPassword = req.body.newPassword;
    var conPassword = req.body.conPassword;

    if (!currentPassword || !newPassword || !conPassword) {
        console.log("You need to fill out all of the fields.")
        return;
    } else if (!bcrypt.compareSync(currentPassword, req.user.password)) {
        console.log("Current password incorrect.")
        return;
    } else if (newPassword != conPassword) {
        console.log("Passwords don't match.")
        return;
    } else {
        user.updatePassword(username, newPassword);
        res.redirect("/" + username + "/account");
    }
}

exports.show_account_delete = function(req, res) {
    var username = req.user.username;
    var firstName = req.user.firstName;
    
    res.render("user/logged-in/delete-account", {
        "title": "Account",
        "user": req.user,
        "firstName": firstName,
    });
}

exports.post_account_delete = function(req, res) {
    var username = req.user.username;
    var password = req.body.password;

    if (!password) {
        console.log("You need to enter your password to delete your account.")
        return;
    } else if (!bcrypt.compareSync(password, req.user.password)) {
        console.log("Password incorrect.")
        return;
    } else {
        user.delete(username);
    }

    res.redirect("/");
}

exports.show_achievements = function(req, res) {
    var username = req.user.username;
    var firstName = req.user.firstName;
    
    var achievements = Object.entries(req.user.achievements);
    var achieveData = new Array();
    for (var i = 0; i < achievements.length; i++) {
        achieveData.push(achievements[i][1])
    }
    res.render("user/logged-in/achievements", {
        "title": "Achievements",
        "user": req.user,
        "username": username,
        "firstName": firstName,
        "achievements": achieveData,
    });
}

exports.show_achievement = function(req, res) {
    var username = req.user.username;
    var firstName = req.user.firstName;
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
        "firstName": firstName,
        "achievement": achievement,
        "earned": earned,
    });
}

exports.show_new_goal = function(req, res) {
    var username = req.user.username;
    var firstName = req.user.firstName;
    res.render("user/logged-in/add-goal", {
        "title": "Add New Goal",
        "user": req.user,
        "username": username,
        "firstName": firstName,
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
        console.log("All fields not complete.")
        return;
    }
    user.addGoal(username, name, type, complete, dateCreated, dateSet, dateComplete, description, id);
    res.redirect("/" + username + "/goals");
}

exports.show_goals = function(req, res) {
    var username = req.user.username;
    var firstName = req.user.firstName;
    
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
        "firstName": firstName,
        "sGoals": setGoalData,
        "cGoals": completeGoalData,
    });
}

exports.show_goal = function(req, res) {
    var username = req.user.username;
    var firstName = req.user.firstName;
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
        "firstName": firstName,
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
    var firstName = req.user.firstName;
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
        "firstName": firstName,
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
    var dateCreated;
    var dateComplete;
    var complete;

    var goal = Object.entries(req.user.goals);
    var goalData;

    for (var i = 0; i < goal.length; i++) {
        if (goal[i][1].id == id) {
            goalData = goal[i][1];
            dateCreated = goalData.dateCreated;
            dateComplete = goalData.dateComplete;
            complete = goalData.complete;
        }
    }

    if (!name || !type || !dateSet || !description) {
        console.log("All fields not complete.")
        return;
    }

    user.editGoal(username, name, type, complete, dateCreated, dateSet, dateComplete, description, id);

    res.redirect("/" + username + "/goal/" + id);
}

exports.show_complete_goal = function(req, res, next) {
    var username = req.user.username;
    var firstName = req.user.firstName;
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
        "firstName": firstName,
        "goal": goalData,
        "id": id,
    });
}

exports.post_complete_goal = function(req, res, next) {
    var username = req.user.username;
    var id = req.params.id;
    var goal = Object.entries(req.user.goals);
    var dateComplete = Math.round((Date.now() / 1000)) * 1000;
    var type;

    for (var i = 0; i < goal.length; i++) {
        if (goal[i][1].id == id) {
            type = goal[i][1].type;
        }
    }

    user.completeGoal(username, id, type, dateComplete);

    res.redirect("/" + username + "/goal/" + id);
}

exports.show_delete_goal = function(req, res, next) {
    var username = req.user.username;
    var firstName = req.user.firstName;
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
        "firstName": firstName,
        "goal": goalData,
        "id": id,
    });
}

exports.post_delete_goal = function(req, res, next) {
    var username = req.user.username;
    var id = req.params.id;

    user.deleteGoal(username, id);
    
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