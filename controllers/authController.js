const asyncHandler = require("express-async-handler");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("../models/user");

passport.use(
  new LocalStrategy(
    asyncHandler(async (username, password, cb) => {
      let user = await User.findOne({ username: username });
      if (!user) {
        return cb(null, false, { message: "Incorrect username." });
      }

      user.comparePassword(password, function (err, isMatch) {
        if (err) return cb(err);
        if (!isMatch)
          return cb(null, false, { message: "Incorrect password." });
        return cb(null, user);
      });
    })
  )
);

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

exports.login_get = asyncHandler(async (req, res, next) => {
  res.render("login");
});

exports.login_post = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/auth/login",
  failureMessage: true,
});

exports.register_get = asyncHandler(async (req, res, next) => {
  res.render("register");
});

exports.register_post = asyncHandler(async (req, res, next) => {
  // TODO: Add validation
  const users = await User.findOne({ username: req.body.username });
  if (users) {
    return res.render("register", { messages: ["Username already exists"] });
  }
  let user = new User({
    username: req.body.username,
    password: req.body.password,
    admin: false,
  });
  await user.save();
  res.redirect("/");
});

exports.logout_post = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};
