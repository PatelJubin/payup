const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../../models/User");

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
  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        return res.status(400).json("email exists");
      }

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        MoneyOwedToMe: 0,
        MoneyOwedToOthers: 0
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    })
    .catch(err => res.json(err));
});

//@route    GET api/users/:email
//@desc     Get list of user emails / might be used for dropdowns
//@access   Private
router.get("/:email", (req, res) => {
  res.json();
});

module.exports = router;
