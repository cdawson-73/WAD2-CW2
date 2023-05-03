const path = require("path");
const nedb = require("nedb");
const bcrypt = require("bcrypt")
const saltRounds = 10;

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
            var entry = {
                user: username,
                password: hash
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

    lookup(user, cb) {
        this.uDb.find({"user": user}, function(err, entries) {
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

module.exports = UserDao;