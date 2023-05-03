const express = require("express");
const router = express.Router();
const controller = require("../controllers/wellbeingController.js");
const auth = require("../auth/auth.js");
const loginCheck = require("connect-ensure-login");

router.get("/", loginCheck.ensureLoggedOut("/loggedIn"), controller.show_homepage);
router.get("/loggedIn", loginCheck.ensureLoggedIn("/"), controller.show_homepage);

router.get("/about", loginCheck.ensureLoggedOut("/loggedIn/about"), controller.show_about);
router.get("/loggedIn/about", loginCheck.ensureLoggedIn("/about"), controller.show_about);

router.get("/useful-links", loginCheck.ensureLoggedOut("/loggedIn/useful-links"), controller.show_usefull);
router.get("/loggedIn/useful-links", loginCheck.ensureLoggedIn("/useful-links"), controller.show_usefull);

router.get("/login", loginCheck.ensureLoggedOut("/account"), controller.show_login);
router.post("/login", auth.authorize("/login"), controller.post_login);

router.get("/signup", loginCheck.ensureLoggedOut("/loggedIn"), controller.show_signup);
router.post("/signup", controller.post_new_user);

router.get("/account", loginCheck.ensureLoggedIn("/login"), controller.show_account);

router.get("/logout", controller.logout);

router.get("*", controller.not_found);

router.use(function (err, req, res, next) {
    res.sendStatus(500);
    res.type("text/plain");
    res.send("Internal Server Error");
});

module.exports = router;