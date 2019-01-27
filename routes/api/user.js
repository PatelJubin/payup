const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../../models/User");
const keys = require("../../config/keys");

//@route    POST api/users/login
//@desc     login users and return JWT
//@access   Public
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email }).then(user => {
    if (!user) {
      return res.status(404).json("user not found");
    }

    //if user is found check password
    bcrypt.compare(password, user.password).then(isAMatch => {
      if (isAMatch) {
        //user password correct
        const payload = { id: user.id, name: user.name, email: user.email };
        const cookieFlags = { httpOnly: true, secure: true, sameSite: "lax" };

        //sign jwt with our secret and set cookie flags and return jwt
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 19400 },
          (err, token) => {
            if (err) return res.status(500).json(err);
            res.cookie("jwt", token, cookieFlags);
            return res.json({ success: true, jwt: token });
          }
        );
      } else {
        return res.status(400).json("Password incorrect");
      }
    });
  });
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
