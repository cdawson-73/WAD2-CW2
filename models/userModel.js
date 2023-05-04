const path = require("path");
const nedb = require("nedb");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { achieve } = require("./achievementModel.js");


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

    create(username, password) {
        const that = this.uDb;
        bcrypt.hash(password, saltRounds).then(function(hash) {
            var achievements = achieve();
            
            var entry = {
                username: username,
                password: hash,
                //achievements: achievements,
            };
            that.insert(entry, function(err) {
                if (err) {
                    console.log("Can't insert user: ", username);
                } else {
                    console.log("User created.");
                    console.log(achievements[0]);
                }
            });
        });
    }

    lookup(user, cb) {
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
}

module.exports = new UserDao();