const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const urlSchema = mongoose.Schema({
  longUrl: {
    type: String,
    require: true,
    trim: true,
  },
  shortUrl: {
    type: String,
    require: true,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  user: {
    type: String,
    require: true,
    trim: true,
  },
});

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = {
  User: mongoose.model("User", userSchema),
  URL: mongoose.model("URL", urlSchema),
};
