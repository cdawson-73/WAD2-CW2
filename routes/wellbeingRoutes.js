const express = require("express");
const router = express.Router();
const controller = require("../controllers/wellbeingController.js");
const auth = require("../auth/auth.js");
const loginCheck = require("connect-ensure-login");

// Pages anyone can access.
router.get("/", controller.show_homepage);
router.get("/terms-and-conditions", controller.show_terms);
router.get("/useful-links", controller.show_usefull);

// Login page.
router.get("/login", loginCheck.ensureLoggedOut("/:username/account"), controller.show_login);
router.post("/login", auth.authorize("/login"), controller.post_login);

// Sign up page.
router.get("/signup", loginCheck.ensureLoggedOut("/:username/account"), controller.show_signup);
router.post("/signup", loginCheck.ensureLoggedOut("/:username/account"), controller.post_new_user);

// Forgot password page.

router.get("/reset-password", loginCheck.ensureLoggedOut("/:username/account"), controller.show_forgot_password);
router.post("/reset-password", loginCheck.ensureLoggedOut("/:username/account"), controller.post_forgot_password);

router.get("/new-password", loginCheck.ensureLoggedOut("/:username/account"), controller.show_new_password);
router.post("/new-password", loginCheck.ensureLoggedOut("/:username/account"), controller.post_new_password);

// User only pages.

// Dashboard & Account.
router.get("/:username/dashboard", loginCheck.ensureLoggedIn("/login"), controller.show_dashboard);
router.get("/:username/account", loginCheck.ensureLoggedIn("/login"), controller.show_account);

router.get("/:username/update-account", loginCheck.ensureLoggedIn("/login"), controller.show_account_edit);
router.post("/:username/update-account", loginCheck.ensureLoggedIn("/login"), controller.post_account_edit);

router.get("/:username/update-password", loginCheck.ensureLoggedIn("/login"), controller.show_password_edit);
router.post("/:username/update-password", loginCheck.ensureLoggedIn("/login"), controller.post_password_edit);

router.get("/:username/delete-account", loginCheck.ensureLoggedIn("/login"), controller.show_account_delete);
router.post("/:username/delete-account", loginCheck.ensureLoggedIn("/login"), controller.post_account_delete);

// Achievements.
router.get("/:username/achievements", loginCheck.ensureLoggedIn("/login"), controller.show_achievements);
router.get("/:username/achievement/:name", loginCheck.ensureLoggedIn("/login"), controller.show_achievement);

// Add Goal.
router.get("/:username/add-goal", loginCheck.ensureLoggedIn("/login"), controller.show_new_goal);
router.post("/:username/add-goal", loginCheck.ensureLoggedIn("/login"), controller.post_new_goal);

// Show Goals.
router.get("/:username/goals", loginCheck.ensureLoggedIn("/login"), controller.show_goals);
router.get("/:username/goal/:id", loginCheck.ensureLoggedIn("/login"), controller.show_goal);

// Edit Goals.
router.get("/:username/edit-goal/:id", loginCheck.ensureLoggedIn("/login"), controller.show_edit_goal);
router.post("/:username/edit-goal/:id", loginCheck.ensureLoggedIn("/login"), controller.post_edit_goal);

// Complete Goal.
router.get("/:username/complete-goal/:id", loginCheck.ensureLoggedIn("/login"), controller.show_complete_goal);
router.post("/:username/complete-goal/:id", loginCheck.ensureLoggedIn("/login"), controller.post_complete_goal);

// Delete Goal.
router.get("/:username/delete-goal/:id", loginCheck.ensureLoggedIn("/login"), controller.show_delete_goal);
router.post("/:username/delete-goal/:id", loginCheck.ensureLoggedIn("/login"), controller.post_delete_goal);

// Articles
router.get("/:username/articles", loginCheck.ensureLoggedIn("/login"), controller.show_articles);

// Fitness
router.get("/:username/fitness", loginCheck.ensureLoggedIn("/login"), controller.show_fitness_articles);

// Healthy-Living
router.get("/:username/healthy-living", loginCheck.ensureLoggedIn("/login"), controller.show_health_articles);

// Nutrition
router.get("/:username/nutrition", loginCheck.ensureLoggedIn("/login"), controller.show_nutrition_articles);

// Individual
router.get("/:username/article/:articleTitle", loginCheck.ensureLoggedIn("/login"), controller.show_article);

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