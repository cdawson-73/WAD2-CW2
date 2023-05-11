const user = require("../models/userModel.js");
const articles = require("../models/wellbeingModel.js");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../utils/sendEmail.js");
const validator = require("validator");


exports.show_homepage = function(req, res) {
    res.render("guest/home", {
        "title": "Wellbeing HQ",
        "user": req.user,
    });
}

exports.show_terms = function(req, res) {
    
    res.render("guest/terms-and-conditions", {
        "title": "Terms & Conditions",
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
    var errors = req.session.messages;
    var error;

    if (!errors) {
        error = error;
    } else {
        error = "Invalid Username Or Password"
    }

    console.log(error);
    res.render("user/login", {
        "title": "Login",
        "error": error,
    });
}

exports.post_login = function(req, res) {
    var username = req.user.username;

    res.redirect("/"+ username +"/dashboard");
   };

exports.show_signup = function(req, res) {

    res.render("user/register", {
        "title": "Sign Up"
    });
}

exports.post_new_user = function(req, res) {
    var username = req.body.username;
    var password = req.body.password
    var email = req.body.email;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var conPassword = req.body.confirmPassword;
    var error;
    
    if (!validator.trim(username) || !validator.trim(password) || !validator.trim(conPassword) || !validator.trim(email) || !validator.trim(firstName) || !validator.trim(lastName)) {
        error = "You need to fill out all of the fields.";
        console.log(error);
        res.render("user/register", {
            "title": "Sign Up",
            "error": error,
        });
    } else if (!validator.isLength(username, {min: 5, max: 15})) {
        error = "Username must be a minimum of 5 and maximum of 15 characters.";
        console.log(error);
        res.render("user/register", {
            "title": "Sign Up",
            "error": error,
        });
    } else if (!validator.isStrongPassword(password, {minLength: 8, minLowercase: 1, minUppercase: 0, minNumbers: 1, minSymbols: 0, returnScore: false})) {
        error = "Password must be a minimum length of 8 and contain at least one number and one lowercase letter.";
        console.log(error);
        res.render("user/register", {
            "title": "Sign Up",
            "error": error,
        });
    } else if (password != conPassword) {
        error = "Passwords don't match.";
        console.log(error);
        res.render("user/register", {
            "title": "Sign Up",
            "error": error,
        });
    } else if (!validator.isEmail(email)) {
        error = "This is not a valid email.";
        console.log(error);
        res.render("user/register", {
            "title": "Sign Up",
            "error": error,
        });
    } else if (email == process.env.USER) {
        error = "This email is unavailable.";
        console.log(error);
        res.render("user/register", {
            "title": "Sign Up",
            "error": error,
        });
    } else {
        user.lookupUser(username, function(err, u) {
            if (u) {
                error = username + " exists.";
                console.log(error);
                res.render("user/register", {
                    "title": "Sign Up",
                    "error": error,
                });
            } else {
                user.lookupEmail(email, function(err, u) {
                    if (u) {
                        error = email + " exists.";
                        console.log(error);
                        res.render("user/register", {
                            "title": "Sign Up",
                            "error": error,
                        });
                    } else {
                        user.create(username, password, email, firstName, lastName);
                        res.redirect('/login');
                    }
                });   
            }
       });
    }
}

exports.show_forgot_password = function(req, res) {

    res.render("user/forgot-password", {
        "title": "Forgot Password"
    });
}

exports.post_forgot_password = function(req, res) {
    var email = req.body.email;
    var subject = "Password Reset Request";
    var error;

    if (!validator.isEmail(email)) {
        error = "This is not a valid email.";
            console.log(error);
            res.render("user/forgot-password", {
                "title": "Forgot Password",
                "error": error,
            });
    } else {
        user.lookupEmail(email, function(err, u) {
            if (!u) {
                error = "This email is not registered.";
                console.log(error);
                res.render("user/forgot-password", {
                    "title": "Forgot Password",
                    "error": error,
                });
            } else {
                user.getDetails(email).then((data) => {
                    var username = data[0].username;
                    var password = data[0].password;
                    var link;
                    var content;
                    var resetHash = user.passwordResetHash(password);
                    link = process.env.SITEURL + "/new-password?email=" + email + "&key=" + resetHash;
                    //link = "http://localhost:3000/new-password?email=" + email + "&key=" + resetHash;
                    content = username + " you requested to reset your password. <a href='" + link + "'>Click this link to reset your password.</a>";
                    sendEmail(email, subject, content);
                    res.redirect('/login');
                });
            }
        });
    } 
}

exports.show_new_password = function(req, res) {
    var email = req.query.email;
    var hash = req.query.key;
    var error;

    user.getDetails(email).then((data) => {
        user.lookupEmail(email, function(err, u) {
            if (!u) {
                error = "Something went wrong, please try again.";
                console.log(error);
                res.render("user/login", {
                    "title": "Login",
                    "error": error
                });
            } else if (!user.verifyPasswordResetHash(data[0].password, hash)) {
                error = "Something went wrong, please try again.";
                console.log(error);
                res.render("user/login", {
                    "title": "Login",
                    "error": error
                });
            } else {
                res.render("user/reset-password", {
                    "title": "Reset Password"
                });   
            }
        });
    });
}

exports.post_new_password = function(req, res) {
    var email = req.query.email;
    var newPassword = req.body.newPassword;
    var conPassword = req.body.conPassword;
    var error;

    if (!validator.trim(newPassword) || !validator.trim(conPassword)) {
        error = "You need to fill out all of the fields.";
        console.log(error);
        res.render("user/reset-password", {
            "title": "Reset Password",
            "error": error,
        });
        
    } else if (!validator.isStrongPassword(newPassword, {minLength: 8, minLowercase: 1, minUppercase: 0, minNumbers: 1, minSymbols: 0, returnScore: false})) {
        error = "Password must be a minimum length of 8 and contain at least one number and one lowercase letter.";
        console.log(error);
        res.render("user/reset-password", {
            "title": "Reset Password",
            "error": error,
        });
    } else if (newPassword != conPassword) {
        error = "Passwords don't match.";
        console.log(error);
        res.render("user/reset-password", {
            "title": "Reset Password",
            "error": error,
        });
        
    } else {
        user.getDetails(email).then((data) => {
            var username = data[0].username;
            user.updatePassword(username, newPassword);
            res.redirect("/login"); 
        });
    }
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
    username = validator.escape(username);
    var email = req.body.email;
    var firstName = req.body.firstName;
    firstName = validator.escape(firstName);
    var lastName = req.body.lastName;
    lastName = validator.escape(lastName);
    var password = req.body.password;
    var error;

    if (!validator.trim(username) || !validator.trim(email) || !validator.trim(firstName) || !validator.trim(lastName)) {
        console.log(error);
        error = "You need to fill out all of the fields.";
        res.render("user/logged-in/edit-account", {
            "title": "Account",
            "user": req.user,
            "firstName": firstName,
            "error": error,
        });
    } else if (!password) {
        console.log(error);
        error = "You need to enter your password to update your account.";
        res.render("user/logged-in/edit-account", {
            "title": "Account",
            "user": req.user,
            "firstName": firstName,
            "error": error,
        });
    } else if (!validator.isEmail(email)) {
        error = "This is not a valid email.";
        console.log(error);
        res.render("user/register", {
            "title": "Sign Up",
            "error": error,
        });
    } else if (email == process.env.USER) {
        console.log(error);
        error = "This email is unavailable.";
        res.render("user/logged-in/edit-account", {
            "title": "Account",
            "user": req.user,
            "firstName": firstName,
            "error": error,
        });
    } else if (!bcrypt.compareSync(password, req.user.password)) {
        console.log(error);
        error = "Password incorrect.";
        res.render("user/logged-in/edit-account", {
            "title": "Account",
            "user": req.user,
            "firstName": firstName,
            "error": error,
        });
    } else {
        if (email != req.user.email) {
            user.lookupEmail(email, function(err, u) {
                if (u) {
                    console.log(error);
                    error = email + " exists.";
                    res.render("user/logged-in/edit-account", {
                        "title": "Account",
                        "user": req.user,
                        "firstName": firstName,
                        "error": error,
                    });
                } else {
                    user.update(username, email, firstName, lastName);
                    res.redirect("/" + username + "/account");
                }
           });
        } else {
            user.update(username, email, firstName, lastName);
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
    var firstName = req.user.firstName;
    var currentPassword = req.body.currentPassword;
    var newPassword = req.body.newPassword;
    var conPassword = req.body.conPassword;
    var error;

    if (!validator.trim(currentPassword) || !validator.trim(newPassword) || !validator.trim(conPassword)) {
        error = "You need to fill out all of the fields.";
        console.log(error);
        res.render("user/logged-in/edit-password", {
            "title": "Account",
            "user": req.user,
            "firstName": firstName,
            "error": error,
        });
    } else if (!bcrypt.compareSync(currentPassword, req.user.password)) {
        error = "Current password incorrect.";
        console.log(error);
        res.render("user/logged-in/edit-password", {
            "title": "Account",
            "user": req.user,
            "firstName": firstName,
            "error": error,
        });
    } else if (!validator.isStrongPassword(newPassword, {minLength: 8, minLowercase: 1, minUppercase: 0, minNumbers: 1, minSymbols: 0, returnScore: false})) {
        error = "Password must be a minimum length of 8 and contain at least one number and one lowercase letter.";
        console.log(error);
        res.render("user/logged-in/edit-password", {
            "title": "Account",
            "user": req.user,
            "firstName": firstName,
            "error": error,
        });
    } else if (newPassword != conPassword) {
        error = "Passwords don't match.";
        console.log(error);
        res.render("user/logged-in/edit-password", {
            "title": "Account",
            "user": req.user,
            "firstName": firstName,
            "error": error,
        });
    } else {
        user.updatePassword(username, newPassword);
        res.redirect("/" + username + "/account");
    }
}

exports.show_account_delete = function(req, res) {
    var firstName = req.user.firstName;
    
    res.render("user/logged-in/delete-account", {
        "title": "Account",
        "user": req.user,
        "firstName": firstName,
    });
}

exports.post_account_delete = function(req, res) {
    var username = req.user.username;
    var firstName = req.user.firstName;
    var password = req.body.password;
    var error;

    if (!password) {
        error = "You need to enter your password to delete your account."
        console.log(error)
        res.render("user/logged-in/delete-account", {
            "title": "Account",
            "user": req.user,
            "firstName": firstName,
            "error": error,
        });
    } else if (!bcrypt.compareSync(password, req.user.password)) {
        error = "Password incorrect."
        console.log(error)
        res.render("user/logged-in/delete-account", {
            "title": "Account",
            "user": req.user,
            "firstName": firstName,
            "error": error,
        });
    } else {
        user.delete(username);
        res.redirect("/");
    }
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
    var minDate = new Intl.DateTimeFormat("fr-CA", {year: "numeric", month: "2-digit", day: "2-digit"}).format(Date.now()+86400000);
    res.render("user/logged-in/add-goal", {
        "title": "Add New Goal",
        "user": req.user,
        "username": username,
        "firstName": firstName,
        "minDate": minDate,
    });
}

exports.post_new_goal = function(req, res) {
    var username = req.user.username;
    var firstName = req.user.firstName;
    var name = req.body.name;
    name = validator.escape(name);
    var type = req.body.type;
    var complete = "false";
    var dateCreated = Math.round((Date.now() / 1000)) * 1000;
    var dateSet = req.body.date;
    dateSet =  Date.parse(dateSet);
    var dateComplete = "null";
    var description = req.body.description;
    description = validator.escape(description);
    var id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    var minDate = new Intl.DateTimeFormat("fr-CA", {year: "numeric", month: "2-digit", day: "2-digit"}).format(Date.now()+86400000);
    var error;

    if (!validator.trim(name) || !type || !dateSet || !validator.trim(description)) {
        error = "All fields not complete.";
        console.log(error);
        res.render("user/logged-in/add-goal", {
            "title": "Add New Goal",
            "user": req.user,
            "username": username,
            "firstName": firstName,
            "minDate": minDate,
            "error": error,
        });
        
    } else {
        user.addGoal(username, name, type, complete, dateCreated, dateSet, dateComplete, description, id);
        res.redirect("/" + username + "/goals");
    }
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
    var name;

    for (var i = 0; i < goal.length; i++) {
        if (goal[i][1].id == id) {
            goalData = goal[i][1];
            if (goalData.complete == "true") {
                cGoal = goalData;
                name = cGoal.name;
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
                name = sGoal.name;
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
        "name": name,
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
    var minDate = new Intl.DateTimeFormat("fr-CA", {year: "numeric", month: "2-digit", day: "2-digit"}).format(Date.now()+86400000);

    for (var i = 0; i < goal.length; i++) {
        if (goal[i][1].id == id) {
            goalData = goal[i][1];
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
        "minDate": minDate,
    });
}

exports.post_edit_goal = function(req, res) {
    var username = req.user.username;
    var firstName = req.user.firstName;
    var id = req.params.id;
    var name = req.body.name;
    name = validator.escape(name);
    var oldName;
    var type = req.body.type;
    var fitness;
    var health;
    var nutrition;
    var dateSet = req.body.date;
    dateSet =  Date.parse(dateSet);
    var description = req.body.description;
    description = validator.escape(description);
    var oldDescription;
    var dateCreated;
    var dateComplete;
    var complete;
    var goal = Object.entries(req.user.goals);
    var goalData;
    var minDate = new Intl.DateTimeFormat("fr-CA", {year: "numeric", month: "2-digit", day: "2-digit"}).format(Date.now()+86400000);
    var error;

    for (var i = 0; i < goal.length; i++) {
        if (goal[i][1].id == id) {
            goalData = goal[i][1];
            oldName = goalData.name;
            oldDescription = goalData.description;
            dateCreated = goalData.dateCreated;
            dateComplete = goalData.dateComplete;
            complete = goalData.complete;
            if (goalData.type == "fitness") {
                fitness = goalData.type
            } else if (goalData.type == "health") {
                health = goalData.type
            } else {
                nutrition = goalData.type
            }
        }
    }

    if (!validator.trim(name) || !type || !dateSet || !validator.trim(description)) {
        error = "All fields not complete.";
        console.log(error);
        res.render("user/logged-in/edit-goal", {
            "title": "Edit Goal",
            "user": req.user,
            "username": username,
            "firstName": firstName,
            "name": oldName,
            "fitness": fitness,
            "health": health,
            "nutrition": nutrition,
            "date": new Intl.DateTimeFormat("fr-CA", {year: "numeric", month: "2-digit", day: "2-digit"}).format(goalData.dateSet),
            "description": oldDescription,
            "id": id,
            "minDate": minDate,
            "error": error,
        });
    } else {
        user.editGoal(username, name, type, complete, dateCreated, dateSet, dateComplete, description, id);
        res.redirect("/" + username + "/goal/" + id);
    }
}

exports.show_complete_goal = function(req, res, next) {
    var username = req.user.username;
    var firstName = req.user.firstName;
    var id = req.params.id;
    var goal = Object.entries(req.user.goals);
    var goalData;
    var createDateFormat;
    var setDateFormat;
    var name;

    for (var i = 0; i < goal.length; i++) {
        if (goal[i][1].id == id) {
            goalData = goal[i][1];
            name = goalData.name;
            createDateFormat = goalData.dateCreated;
            setDateFormat = goalData.dateSet;
            createDateFormat = new Intl.DateTimeFormat("en-GB").format(createDateFormat);
            setDateFormat = new Intl.DateTimeFormat("en-GB").format(setDateFormat);
            goalData.dateCreated = createDateFormat;
            goalData.dateSet = setDateFormat;
        }
    }

    res.render("user/logged-in/complete-goal", {
        "title": "Complete Goal",
        "user": req.user,
        "username": username,
        "firstName": firstName,
        "goal": goalData,
        "id": id,
        "name": name,
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
    var name;

    for (var i = 0; i < goal.length; i++) {
        if (goal[i][1].id == id) {
            goalData = goal[i][1];
            name = goalData.name;
            createDateFormat = goalData.dateCreated;
            setDateFormat = goalData.dateSet;
            createDateFormat = new Intl.DateTimeFormat("en-GB").format(createDateFormat);
            setDateFormat = new Intl.DateTimeFormat("en-GB").format(setDateFormat);
            goalData.dateCreated = createDateFormat;
            goalData.dateSet = setDateFormat;
        }
    }

    res.render("user/logged-in/delete-goal", {
        "title": "Complete Goal",
        "user": req.user,
        "username": username,
        "firstName": firstName,
        "goal": goalData,
        "name": name,
        "id": id,
    });
}

exports.post_delete_goal = function(req, res, next) {
    var username = req.user.username;
    var id = req.params.id;

    user.deleteGoal(username, id);
    res.redirect("/" + username + "/goals");
}

exports.show_articles = function(req, res) {
    var username = req.user.username;
    var firstName = req.user.firstName;

    res.render("user/logged-in/articles", {
        "title": "Wellbeing HQ Articles",
        "user": req.user,
        "username": username,
        "firstName": firstName,
    });
}

exports.show_article = function(req, res) {
    var username = req.user.username;
    var firstName = req.user.firstName;
    var articleTitle = req.params.articleTitle;

    articles.article(articleTitle).then((data) => {
        article = data;

        var articleDate = article[0].dateCreated;
        var articleContent = validator.unescape(article[0].content);


        var date = new Intl.DateTimeFormat("en-GB").format(articleDate);
        var time = new Intl.DateTimeFormat("default", {hourCycle: "h12", hour: "numeric", minute: "numeric", second: "numeric"}).format(articleDate);
        var timeDate = "Published at " + time + " on " + date ;


        res.render("user/logged-in/article", {
            "title": articleTitle,
            "user": req.user,
            "username": username,
            "firstName": firstName,
            "article": article,
            "timeDate": timeDate,
            "articleContent": articleContent,
        });
    });
}

exports.show_fitness_articles = function(req, res) {
    var username = req.user.username;
    var firstName = req.user.firstName;
    var fitnessArticles;
    articles.fitnessArticles().then((data) => {
        fitnessArticles = data;

        res.render("user/logged-in/topic/fitness", {
            "title": "Fitness Articles",
            "user": req.user,
            "username": username,
            "firstName": firstName,
            "articles": fitnessArticles,
        });
    });
}

exports.show_health_articles = function(req, res) {
    var username = req.user.username;
    var firstName = req.user.firstName;
    var healthArticles;
    articles.healthArticles().then((data) => {
        healthArticles = data;

        res.render("user/logged-in/topic/healthy-living", {
            "title": "Healthy-Living Articles",
            "user": req.user,
            "username": username,
            "firstName": firstName,
            "articles": healthArticles,
        });
    });
}

exports.show_nutrition_articles = function(req, res) {
    var username = req.user.username;
    var firstName = req.user.firstName;
    var nutritionArticles;
    articles.nutritionArticles().then((data) => {
        nutritionArticles = data;

        res.render("user/logged-in/topic/nutrition", {
            "title": "Nutrition Articles",
            "user": req.user,
            "username": username,
            "firstName": firstName,
            "articles": nutritionArticles,
        });
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