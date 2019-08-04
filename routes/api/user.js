const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../../models/User");
const Group = require("../../models/Group");
const keys = require("../../config/keys");
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

//@route    POST api/users/login
//@desc     login users and return JWT
//@access   Public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email }).then(user => {
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors);
    }

    //if user is found check password
    bcrypt.compare(password, user.password).then(isAMatch => {
      if (isAMatch) {
        //user password correct
        const payload = { id: user.id, name: user.name, email: user.email };
        const cookieFlags = { httpOnly: true, secure: false, sameSite: "lax" };

        //sign jwt with our secret and set cookie flags and return jwt
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 19400 },
          (err, token) => {
            if (err) return res.status(500).json(err);
            res.cookie("jwt", token, cookieFlags);
            res.json({ success: true, token: token });
          }
        );
      } else {
        errors.password = "Password Incorrect";
        return res.status(400).json(errors);
      }
    });
  });
});

//@route    POST api/users/register
//@desc     Register users
//@access   Public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        errors.email = "Email already exists";
        return res.status(400).json(errors);
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

//@route    GET api/users/current
//@desc     Get the current logged in user's information
//@access   Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const loggedUser = {
      id: req.user._id,
      email: req.user.email,
      MoneyOwedToMe: req.user.MoneyOwedToMe,
      MoneyOwedToOthers: req.user.MoneyOwedToOthers
    };
    res.json(loggedUser);
  }
);

router.get(
  "/current/groups",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const mygroups = req.user.groupsID;
    Group.find({ _id: [...mygroups] }).then(groups => {
      res.json(groups);
    });
  }
);

//@route    GET api/users/:email
//@desc     Get list of user emails / might be used for dropdowns
//@access   Private
router.get(
  "/email/:email",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    User.findOne({ email: req.params.email })
      .then(user => {
        if (!user) {
          errors.email = "Email doesn't exist";
          return res.status(404).json(errors);
        }
        res.json({ email: user.email, name: user.name });
      })
      .catch(err => console.log(err));
  }
);

module.exports = router;
