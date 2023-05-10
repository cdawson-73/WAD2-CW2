const path = require("path");
const nedb = require("nedb");;
const articles = require("./articleModel.js");

class WellbeingDAO {
    constructor(dbFilePath) {
        dbFilePath = path.join(__dirname, "../database/articles.db");
        if (dbFilePath) {
            this.aDb = new nedb({
                filename: dbFilePath,
                autoload: true,
            });
            console.log("Connected to article database.");
            this.addArticles();
        } else {
            this.aDb = new nedb({
                filename: "../database/articles.db",
                autoload: true,
            });
        }
    }

    article(articleTitle) {
        return new Promise((resolve, reject) => {
            var db = this.aDb
            db.find({articleTitle: articleTitle}, function(err, entries) {
                if (err) {
                    reject(err);
                    console.log("Failed");
                } else {
                    resolve(entries);
                }
            });
        });
    }

    fitnessArticles() {
        // Returns all fitness articles.

        return new Promise((resolve, reject) => {
            var db = this.aDb
            db.find({author: "Emily Davis"}).sort({dateCreated: -1}).exec(function(err, entries) {
                if (err) {
                    reject(err);
                    console.log("Failed");
                } else {
                    resolve(entries);
                }
            });
        });
    }

    healthArticles() {
        // Returns all health-living articles.

        return new Promise((resolve, reject) => {
            var db = this.aDb
            db.find({author: "Sophie Hutchinson"}).sort({dateCreated: -1}).exec(function(err, entries) {
                if (err) {
                    reject(err);
                    console.log("Failed");
                } else {
                    resolve(entries);
                }
            });
        });
    }

    nutritionArticles() {
        // Returns all nutrition articles.

        return new Promise((resolve, reject) => {
            var db = this.aDb
            db.find({author: "Jacob Johnson"}).sort({dateCreated: -1}).exec(function(err, entries) {
                if (err) {
                    reject(err);
                    console.log("Failed");
                } else {
                    resolve(entries);
                }
            });
        });
    }

    addArticles() {
        // Checks if articles database has any entries, if no adds them from articleModel.

        return new Promise((resolve, reject) => {
            var db = this.aDb
            db.find({}, function(err, entries) {
                if (err) {
                    reject(err);
                    console.log("Failed");
                } else {
                    resolve(entries);
                    if (entries.length < 1) {
                        db.insert(articles.articles(), function(err) {
                            if (err) {
                                console.log("Can't insert articles");
                            } else {
                                console.log("Articles inserted.");
                            }
                        });
                    }
                }
            });
        });
    }
}
module.exports = new WellbeingDAO();