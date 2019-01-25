const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

//@route    POST api/users/login
//@desc     login users and return JWT
//@access   Public
router.post("/login", (req, res) => {
  res.json();
});

//@route    POST api/users/register
//@desc     Register users
//@access   Public
router.post("/register", (req, res) => {
  res.json();
});

//@route    GET api/users/:email
//@desc     Get list of user emails / might be used for dropdowns
//@access   Private
router.get("/:email", (req, res) => {
  res.json();
});
