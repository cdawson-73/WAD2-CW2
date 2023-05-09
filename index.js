const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();

const bodyparser = require("body-parser");

app.use(bodyparser.json());
app.use(express.urlencoded( {
    extended: true
}));

const path = require("path");
const public = path.join(__dirname, "public");
app.use(express.static(public));

const session = require("express-session");
const auth = require("./auth/auth.js");
const passport = require("passport");

app.use(session({
    secret: "thisisasecret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
auth.init(app);

const mustache = require("mustache-express");
app.engine("mustache", mustache());
app.set("view engine", "mustache");

const router = require("./routes/wellbeingRoutes.js");
app.use("/", router);

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: false
}));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.warn(`App listening on http://localhost${PORT}. Ctrl C to exit.`)
});