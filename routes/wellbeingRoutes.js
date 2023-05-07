const express = require("express");
const router = express.Router();
const controller = require("../controllers/wellbeingController.js");
const auth = require("../auth/auth.js");
const loginCheck = require("connect-ensure-login");

// Pages anyone can access.
router.get("/", controller.show_homepage);
router.get("/about", controller.show_about);
router.get("/useful-links", controller.show_usefull);

// Login page.
router.get("/login", loginCheck.ensureLoggedOut("/:username/account"), controller.show_login);
router.post("/login", auth.authorize("/login"), controller.post_login);

// Sign up page.
router.get("/signup", loginCheck.ensureLoggedOut("/:username/account"), controller.show_signup);
router.post("/signup", controller.post_new_user);

// User only pages.
router.get("/:username/account", loginCheck.ensureLoggedIn("/login"), controller.show_account);
router.get("/:username/achievements", loginCheck.ensureLoggedIn("/login"), controller.show_achievements);
router.get("/:username/achievement/:name", loginCheck.ensureLoggedIn("/login"), controller.show_achievement);
router.get("/:username/add-goal", loginCheck.ensureLoggedIn("/login"), controller.show_new_goal);
router.post("/:username/add-goal", controller.post_new_goal);
router.get("/:username/goals", loginCheck.ensureLoggedIn("/login"), controller.show_goals);
router.get("/:username/goal/:id", loginCheck.ensureLoggedIn("/login"), controller.show_goal);

// Log out page.
router.get("/logout", controller.logout);

// Custom not found page.
router.get("*", controller.not_found);

// Server error.
router.use(function (err, req, res, next) {
    res.sendStatus(500);
    res.type("text/plain");
    res.send("Internal Server Error");
});

module.exports = router;