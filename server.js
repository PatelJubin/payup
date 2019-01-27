// jshint esversion: 6

// Imports
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const https = require("https");
const user = require("./routes/api/user");
const group = require("./routes/api/group");
const cookieParser = require("cookie-parser");
const keys = require("./config/keys");
const app = express();

app.use(cookieParser(keys.secretOrKey));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const db = require("./config/keys").mongoURI;
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.use("/api/users", user);
app.use("/api/group", group);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
/* https.createServer(app).listen(PORT, function(err) {
  if (err) console.log(err);
  else console.log("HTTPS server on http://localhost:%s", PORT);
}); */
