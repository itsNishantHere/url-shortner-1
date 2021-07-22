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
    validate(longUrl) {
      if (!longUrl) {
        throw new Error("URL must be right");
      }
    },
  },
  shortUrl: {
    type: String,
    require: true,
  },
  clicks: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("URL", urlSchema);
