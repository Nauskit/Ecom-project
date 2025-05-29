const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const crypto = require("crypto");
const db = require("./db");

passport.use(new GoogleStrategy({}));
