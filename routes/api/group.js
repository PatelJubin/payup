const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

//@route    GET api/group/:group_name/users
//@desc     Return list of users in given group name / prob used for dropdowns
//@access   Private
router.get("/:group_name/users", (req, res) => {
  res.json();
});

//@route    POST api/group/create
//@desc     Create group
//@access   Private
router.post("/create", (req, res) => {
  res.json();
});

//@route    POST api/group/:group_name/add_users
//@desc     Add user to specificed group
//@access   Private
router.post("/:group_name/add_user", (req, res) => {
  res.json();
});

//@route    DELETE api/group/:group_name/users
//@desc     Delete user from specificed group
//@access   Private
router.delete("/:group_name/users", (req, res) => {
  res.json();
});

module.exports = router;
