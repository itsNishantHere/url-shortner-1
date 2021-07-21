const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/urlshortner", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const urlSchema = mongoose.Schema({
  longUrl: {
    type: String,
    require: true,
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
