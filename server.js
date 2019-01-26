// jshint esversion: 6

// Imports
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const https = require("https");
const user = require("./routes/api/user");
const group = require("./routes/api/group");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  console.log("HTTPS Response", res.statusCode);
  next();
});

app.use("/api/users/", user);
app.use("/api/group/", group);

const PORT = process.env.PORT || 3000;

https.createServer(app).listen(PORT, function(err) {
  if (err) console.log(err);
  else console.log("HTTPS server on http://localhost:%s", PORT);
});
