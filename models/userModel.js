const path = require("path");
const nedb = require("nedb");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { achieve } = require("./achievementModel.js");
const numWords = require("num-words");
const crypto = require("crypto");


class UserDao {
    constructor(dbFilePath) {
        dbFilePath = path.join(__dirname, "../database/users.db");
        if (dbFilePath) {
            this.uDb = new nedb({
                filename: dbFilePath,
                autoload: true
            });
            console.log("Connected to user database.");
        } else {
            this.uDb = new nedb({
                filename: "../database/users.db",
                autoload: true
            });
        }
    }

    create(username, password, email, firstName, lastName) {
        const that = this.uDb;
        bcrypt.hash(password, saltRounds).then(function(hash) {
            var achievements = achieve();
            var entry = {
                username: username,
                password: hash,
                email: email,
                firstName: firstName,
                lastName: lastName,
                generalSet: 0,
                generalComplete: 0,
                fitnessSet: 0,
                fitnessComplete: 0,
                healthSet: 0,
                healthComplete: 0,
                nutritionSet: 0,
                nutritionComplete: 0,
                achievements: achievements,
                goals: {}
            };
            that.insert(entry, function(err) {
                if (err) {
                    console.log("Can't insert user: ", username);
                } else {
                    console.log("User created.");
                }
            });
        });
    }

    lookupUser(user, cb) {
        this.uDb.find({"username": user}, function(err, entries) {
            if (err) {
                return cb(null, null);
            } else {
                if (entries.length == 0) {
                    return cb(null, null);
                }
                return cb(null, entries[0]);
            }
        });
    }

    lookupEmail(email, cb) {
        this.uDb.find({"email": email}, function(err, entries) {
            if (err) {
                return cb(null, null);
            } else {
                if (entries.length == 0) {
                    return cb(null, null);
                }
                return cb(null, entries[0]);
            }
        });
    }

    update(username, email, firstName, lastName) {
        var db = this.uDb;
            return new Promise((resolve, reject) => {
                db.update({
                    username: username,
                    },{
                        $set:{
                                email: email,
                                firstName: firstName,
                                lastName: lastName,
                        }
                    },{
                        upsert: true
                    },
                    function(err, goal) {
                        if(err){
                            reject(err);
                        } else {
                            resolve(goal);
                            console.log("User edited.")
                        }
                    });
            });
    }

    updatePassword(username, password) {
        var db = this.uDb;
        bcrypt.hash(password, saltRounds).then(function(hash) {
            return new Promise((resolve, reject) => {
                db.update({
                    username: username,
                    },{
                        $set:{
                                password: hash,
                        }
                    },{
                        upsert: true
                    },
                    function(err, goal) {
                        if(err){
                            reject(err);
                        } else {
                            resolve(goal);
                            console.log("Password updated.")
                        }
                    });
            });
        });
    }

    passwordResetHash(password) {
        const resetHash = crypto.createHash("sha512").update(password).digest("hex");
        return resetHash;
    }

    verifyPasswordResetHash(password, resetHash) {
        return this.passwordResetHash(password) === resetHash;
    }

    getDetails(email) {
        var db = this.uDb;
        var info;
        return new Promise((resolve, reject) => {
            db.find({
                email: email,
            },{
                username: 1,
                password: 1,
                _id: 0,
            }, function(err, details) {
                if (err) {
                    console.log("Details not found.")
                    reject(err);
                } else {
                    resolve(details);
                    info = details;
                    return info;
                }
            });
            return info;
            })
    }

    useDetails(email) {
        
        return details
    }

    delete(username) {
        var db = this.uDb;
        return new Promise((resolve, reject) =>{
            db.remove({
                username: username,
            },function(err, user) {
                if (err) {
                    reject(err);
                } else {
                    resolve(user);
                    console.log("User deleted.");
                    console.log(user);
                }
            });
        });
    }

    addGoal(username, name, type, complete, dateCreated, dateSet, dateComplete, description, id) {
        var typeIncrement = type.concat("Set");
        var db = this.uDb;
        var goals = "goals." + id;
        return new Promise((resolve, reject) => {
        db.update({
            username: username
            },{
                $inc: {
                    [typeIncrement]: 1,
                    generalSet: 1,
                },
                $set:{
                    [goals]: {
                        name: name,
                        type: type,
                        complete: complete,
                        dateCreated: dateCreated,
                        dateSet: dateSet,
                        dateComplete: dateComplete,
                        description: description,
                        id: id,
                }
            }},
            function(err, goal) {
                if(err){
                    reject(err);
                } else {
                    resolve(goal);
                    console.log("Goal added.");
                }
            });
            this.updateAchievement(username);
    });
}

    editGoal(username, name, type, complete, dateCreated, dateSet, dateComplete, description, id) {
        var typeIncrement = type.concat("Set");
        var db = this.uDb;
        var goals = "goals." + id;
        return new Promise((resolve, reject) => {
        db.update({
            username: username,
            },{
                $inc: {
                    [typeIncrement]: 1,
                },
                $set:{
                    [goals]: {
                        name: name,
                        type: type,
                        complete: complete,
                        dateCreated: dateCreated,
                        dateSet: dateSet,
                        dateComplete: dateComplete,
                        description: description,
                        id: id,
                    }
                }
            },{
                upsert: true
            },
            function(err, goal) {
                if(err){
                    reject(err);
                } else {
                    resolve(goal);
                    console.log("Goal edited.")
                }
            });
            this.updateAchievement(username);
    })
    }

    completeGoal(username, id, type, dateComplete) {
        var typeIncrement = type.concat("Complete");
        var db = this.uDb;
        var goalCompStat = "goals." + id + ".complete";
        var goalCompDate = "goals." + id + ".dateComplete";
        return new Promise((resolve, reject) =>{
            db.update({
                username: username
            },{
                $inc: {
                    [typeIncrement]: 1,
                    generalComplete: 1,
                },
                $set: {
                    [goalCompStat]: "true",
                    [goalCompDate]: dateComplete,
                }
            },
            function(err, goal) {
                if (err) {
                    reject(err);
                } else {
                    resolve(goal);
                    console.log("Goal complete.");
                    console.log(goal);
                }
            });
            this.updateAchievement(username);
        });
    }

    deleteGoal(username, id) {
        var db = this.uDb;
        var goals = "goals." + id;
        return new Promise((resolve, reject) =>{
            db.update({
                username: username
            },{
                $unset: {
                    [goals]: true,
                },
            },function(err, goal) {
                if (err) {
                    reject(err);
                } else {
                    resolve(goal);
                    console.log("Goal deleted.");
                    console.log(goal);
                }
            });
        });
    }

    updateAchievement(username) {
        var db = this.uDb;
        return new Promise((resolve, reject) => {
            db.find({
                username: username,
            },{
                generalSet: 1,
                generalComplete: 1,
                fitnessSet: 1,
                fitnessComplete: 1,
                healthSet: 1,
                healthComplete: 1,
                nutritionSet: 1,
                nutritionComplete: 1,
                _id: 0,
            }, function(err, totals) {
                if (err) {
                    reject(err);
                } else {
                    resolve(totals);
                    var goalTotals = Object.values(totals[0]);
                    for (var i = 0, j = 0, k = 1, l = 2 ; i < goalTotals.length; i++, j += 3, k += 3, l += 3) {
                        if (goalTotals[i] == 1) {
                            var achieved = numWords(j+1);
                            achieved = achieved.replace(/\s+/g, '');
                            var dateComp = "achievements." + achieved + ".dateAchieved";
                            achieved = "achievements." + achieved + ".achieved";
                    db.update({
                        username: username
                        },{
                            $set:{
                                [achieved]: "achieved",
                                [dateComp]: Math.round((Date.now() / 1000)) * 1000,
                            }
                        }, function(err, docs) {
                            if(err) {
                                console.log('error updating documents',err);
                            } else {
                                console.log(docs,'documents updated')
                            }
                        });
                    } else if (goalTotals[i] == 10) {
                        var achieved = numWords(k+1);
                        achieved = achieved.replace(/\s+/g, '');
                        achieved = "achievements." + achieved + ".achieved"
                        db.update({
                            username: username
                        },{
                            $set:{
                                [achieved]: "achieved"
                            }
                        }, function(err, docs) {
                            if(err) {
                                console.log('error updating documents',err);
                            } else {
                                console.log(docs,'documents updated')
                            }
                        });
                    } else if (goalTotals[i] == 20) {
                        var achieved = numWords(l+1);
                        achieved = achieved.replace(/\s+/g, '');
                        achieved = "achievements." + achieved + ".achieved"
                        db.update({
                            username: username
                        },{
                            $set:{
                                [achieved]: "achieved"
                            }
                        }, function(err, docs) {
                            if(err) {
                                console.log('error updating documents',err);
                                } else {
                                console.log(docs,'documents updated')
                                if (Math.min(...goalTotals) >= 20) {
                                    db.update({
                                        username: username
                                        },{
                                            $set:{
                                                "achievements.twentyfive.achieved": "achieved"
                                            }
                                        }, function(err, docs) {
                                            if(err) {
                                                console.log('error updating documents',err);
                                            } else {
                                                console.log(docs,'last documents updated')
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                }
            });
        });
    }
}

module.exports = new UserDao();