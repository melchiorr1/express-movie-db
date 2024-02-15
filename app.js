const createError = require("http-errors");
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const port = 3000;
const passport = require('passport');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

// Load environment variables from .env file
require('dotenv').config()

// set up mongoose connection
// mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGODB_URI;

async function main() {
  await mongoose.connect(mongoDB);
}
main().catch((err) => console.log(err));

const indexRouter = require("./routes/index");
const catalogRouter = require("./routes/catalog")
const authRouter = require("./routes/auth")

// Set the view engine to pug
app.set("views", "./views");
app.set("view engine", "pug");

// Middleware
app.use(express.urlencoded({extended: true}));
app.use(express.json()) // To parse the incoming requests with JSON payloads
app.use(express.static("./public"));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
}));
app.use(passport.authenticate('session'));
// add session information
app.use((req, res, next) => {
  res.locals.messages = req.session.messages || [];
  req.session.messages = [];
  res.locals.user = req.user || null;
  next();
});

// Routes
app.use("/", indexRouter);
app.use("/catalog", catalogRouter)
app.use("/auth", authRouter)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render("error");
    next();
  });

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
