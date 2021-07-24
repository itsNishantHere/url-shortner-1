const express = require("express");
const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");
const uuid = require("uuid");
const bcrypt = require("bcryptjs");
const path = require("path");

const { User, URL } = require("./db");
const session = require("express-session");

const app = express();
const mongoose = require("mongoose");
const MongoDBSession = require("connect-mongodb-session")(session);

app.set("view engine", "ejs");
const port = process.env.PORT;
app.use(express.json());
app.use(bodyParser.json());
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({ extended: true }));

const store = new MongoDBSession({
  uri: process.env.MONGODB_URL,
  collection: "sessions",
});

const isAuth = function (req, res, next) {
  if (req.session.isAuth) {
    next();
  } else {
    res.redirect("/login");
  }
};

app.use(
  session({
    secret: "Secret",
    resave: false,
    saveUninitialized: false,
    store,
  })
);

app.get("/register", (req, res) => {
  res.render("auth", {
    heading: "Register",
    type: "register",
    isAuth: req.session.isAuth,
  });
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  let user = await User.findOne({ email });
  if (user) {
    return res.redirect("/login");
  }

  const hashedPwd = await bcrypt.hash(password, 12);
  user = new User({
    username,
    email,
    password: hashedPwd,
  });

  try {
    await user.save();
    res.redirect("/login");
  } catch (e) {
    res.send(e);
  }
});

app.get("/login", (req, res) => {
  res.render("auth", {
    heading: "Login",
    type: "login",
    isAuth: req.session.isAuth,
  });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.redirect("/register");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.redirect("/login");
  }
  req.session.isAuth = true;
  req.session.username = username;

  res.redirect("/");
});

app.post("/short", isAuth, async (req, res) => {
  const shortUrl = uuid.v4().split("-")[0];
  const url = new URL({
    longUrl: req.body.longUrl,
    shortUrl,
    user: req.session.username,
  });
  try {
    await url.save();
    res.redirect("/");
  } catch (e) {
    res.send("Something went wrong" + e);
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.send("Something went wrong");
    }
    res.redirect("/");
  });
});

app.get("/:url", (req, res) => {
  URL.find({ shortUrl: req.params.url }, async (err, url) => {
    if (err) {
      return res.send("Something went wrong");
    }
    if (url) {
      return res.send("404 Page not found");
    }
    url[0].clicks++;
    await url[0].save();
    res.redirect(url[0].longUrl);
  });
});

app.get("/delete/:id", isAuth, (req, res) => {
  URL.findOneAndDelete({ shortUrl: req.params.id }, (err, url) => {
    if (err) {
      res.send("Something went wrong");
    }
    res.redirect("/");
  });
});

app.get("/", (req, res) => {
  URL.find({ user: req.session.username }, (err, posts) => {
    if (err) {
      res.send("Something went wrong");
    }
    res.render("home", { posts: posts, isAuth: req.session.isAuth });
  });
});

app.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
