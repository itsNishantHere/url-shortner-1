// const express = require("express");
const express = require("express");
const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");
const uuid = require("uuid");
const URL = require("./db");

const app = express();

const port = process.env.PORT;
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", (req, res) => {
  URL.find({}, (err, posts) => {
    if (err) {
      res.send("Something went wrong");
    }
    res.render("home", { posts: posts });
  });
});

app.post("/short", async (req, res) => {
  const shortUrl = uuid.v4().split("-")[0];
  const url = new URL({
    longUrl: req.body.longUrl,
    shortUrl,
  });
  try {
    await url.save();
    res.redirect("/");
  } catch (e) {
    res.send("Something went wrong" + e);
  }
});

app.get("/:url", (req, res) => {
  URL.find({ shortUrl: req.params.url }, async (err, url) => {
    console.log(url);
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

app.get("/delete/:id", (req, res) => {
  URL.findOneAndDelete({ shortUrl: req.params.id }, (err, url) => {
    if (err) {
      res.send("Something went wrong");
    }
    res.redirect("/");
  });
});

app.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
