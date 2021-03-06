const express = require("express");
const router = express.Router();
const passport = require("passport");
const Group = require("../../models/Group");
const User = require("../../models/User");
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

const validateGroupInput = require("../../validation/group");

var incrementUserTotals = (payee, paidfor, paybackAmt) => {
  User.updateOne(
    { email: payee },
    { $inc: { MoneyOwedToMe: paybackAmt * paidfor.length } }
  ).then(() => {});
  User.updateMany(
    { email: [...paidfor] },
    { $inc: { MoneyOwedToOthers: paybackAmt } }
  ).then(() => {});
};

var decrementUserTotals = (payeeUser, paidbackUser, paidAmt) => {
  paidAmt = -paidAmt;
  User.updateOne({ _id: payeeUser }, { $inc: { MoneyOwedToMe: paidAmt } }).then(
    () => {}
  );
  User.updateOne(
    { _id: paidbackUser },
    { $inc: { MoneyOwedToOthers: paidAmt } }
  ).then(() => {});
};

//@route    GET api/group/:group_name/users
//@desc     Return list of users in given group name / prob used for dropdowns
//@access   Private
router.get(
  "/:group_name/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const groupname = req.params.group_name;
    Group.findOne({ groupname: groupname }).then(group => {
      if (!group) return res.status(404).json("Group doesn't exist");
      User.find({ _id: [...group.users] }, { name: 1, email: 1, _id: 0 }).then(
        users => {
          res.json(users);
        }
      );
    });
  }
);

//@route    POST api/group/:group_name/payee
//@desc     Store the history of a transaction and who paid for it
//@access   Private
router.post(
  "/:group_name/transaction",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const groupname = req.params.group_name;
    const payeeEmail = req.body.payeeEmail;
    var paidForEmails = req.body.paidForEmails.toString();
    const amtPaid = req.body.amtPaid;
    const moneyOwedField = {};
    if (typeof paidForEmails !== "undefined") {
      paidForEmails = paidForEmails.replace(/\s/g, "").split(",");
    }
    const amtToPayBack = amtPaid / (paidForEmails.length + 1);
    incrementUserTotals(payeeEmail, paidForEmails, amtToPayBack); //add a function call here to update users moneyowedtome and moneyowedtoothers fields
    moneyOwedField.AmountPaid = amtPaid;

    Group.findOne({ groupname: groupname }).then(group => {
      if (!group) res.status(404).json("group doesn't exist");
      User.findOne({ email: payeeEmail }, { id: 1, name: 1, email: 1 }).then(
        payeeUser => {
          if (!payeeUser) return res.status(404).json("User not found");
          User.find(
            { email: [...paidForEmails] },
            { id: 1, name: 1, email: 1 }
          ).then(paidForUsers => {
            moneyOwedField.payee = payeeUser;

            moneyOwedField.PaidFor = paidForUsers;
            moneyOwedField.AmountToPayBack = amtToPayBack;

            Group.updateOne(
              { groupname: groupname },
              { $push: { moneyOwed: moneyOwedField } },
              { new: true }
            ).then(() => res.json({ tranactionAddedSuccessfully: true }));
          });
        }
      );
    });
  }
);

//@route    POST api/group/create
//@desc     Create group
//@access   Private
router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateGroupInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const group = {};
    group.groupname = req.body.groupname;
    //convert req.body.emails from object to string to do replace and split operations
    //replace and split operations seems to work on an object with 1 email
    //implement the line below if you get var.replace or var.split is not a function
    var emails = req.body.emails.toString();
    if (typeof req.body.emails !== "undefined") {
      emails = emails.replace(/\s/g, "").split(",");
      emails.push(req.user.email);
    }
    Group.findOne({ groupname: group.groupname })
      .then(newGroup => {
        if (newGroup) {
          errors.groupname = "Group name is taken";
          return res.status(400).json(errors);
        }
        User.find({ email: [...emails] }, { id: 1, name: 1, email: 1 }).then(
          users => {
            group.users = users;

            newg = new Group(group)
              .save()
              .then(
                group =>
                  User.updateMany(
                    { _id: [...users] },
                    { $push: { groupsID: group._id } },
                    { upsert: true }
                  )
                    .then(() => console.log({ groupIDAddedToUser: true }))
                    .catch(err => console.log(err)),
                res.json(group)
              )
              .catch(err => console.log(err));
          }
        );
      })
      .catch(err => console.log(err));
  }
);

//@route    POST api/group/:group_name/add_user
//@desc     Add user to specificed group
//@access   Private
router.post(
  "/:group_name/add_user",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const groupname = req.params.group_name;
    //remove whitespace and split at comma
    const emails = req.body.emails.replace(/\s/g, "").split(",");
    User.find({ email: [...emails] }, { id: 1, name: 1, email: 1 }).then(
      usersToAdd => {
        if (!usersToAdd) res.status(404).json("Users not found");
        Group.findOne({ groupname: groupname }).then(group => {
          if (!group) return res.status(404).json("Group doesn't exist");
          User.find({ _id: [...group.users] }, { email: 1 }).then(users => {
            var allEmails = [];
            //get emails from objects and compare to the emails provided from
            // req.body.emails and if match found raise error
            users.forEach(addEmail => allEmails.push(addEmail.email));
            var Repeats = allEmails.some(dup => emails.indexOf(dup) >= 0);
            if (Repeats)
              return res.status(400).json("Duplicate emails provided");
            //if no duplicates found go ahead and add users to group
            Group.updateOne(
              { groupname: groupname },
              { $push: { users: { $each: usersToAdd } } }
            )
              .then()
              .catch(err => console.log(err));

            User.updateMany(
              { _id: [...usersToAdd] },
              { $push: { groupsID: group._id } },
              { upsert: true }
            )
              .then(() => res.json({ GroupUpdated: true }))
              .catch(err => console.log(err));
          });
        });
      }
    );
  }
);

//@route    DELETE api/group/:group_name/:transaction_id/:user_id/paid
//@desc     Delete user from moneyOwed field if they paid back
//@access   Private
router.delete(
  "/:group_name/:transaction_id/:user_id/paid",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const transaction_id = req.params.transaction_id;
    const groupname = req.params.group_name;
    const user_id = req.params.user_id;
    Group.findOne({ groupname: groupname }, { moneyOwed: 1 }).then(group => {
      if (!group) return res.status(404).json("group not found");
      const transactionIndex = group.moneyOwed
        .map(item => item.id)
        .indexOf(transaction_id);
      const userIndex = group.moneyOwed[transactionIndex].PaidFor.indexOf(
        user_id
      );
      const payeeID = group.moneyOwed[transactionIndex].payee;
      const paidAmt = group.moneyOwed[transactionIndex].AmountToPayBack;
      decrementUserTotals(payeeID, user_id, paidAmt);
      group.moneyOwed[transactionIndex].PaidFor.splice(userIndex, 1);
      group.save().then(group => res.json(group));
    });
  }
);

//@route    DELETE api/group/:group_name/users
//@desc     Delete user from specificed group
//@access   Private
router.delete(
  "/:group_name/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const groupname = req.params.group_name;
    const userToDelete = req.body.email;
    Group.findOne({ groupname: groupname }).then(group => {
      User.findOne({ email: userToDelete }).then(user => {
        const removeIndex = group.users.map(item => item.id).indexOf(user.id);
        group.users.splice(removeIndex, 1);
        group
          .save()
          .then(group => res.json(group))
          .catch(err => res.status(404).json(err));
      });
    });
  }
);

module.exports = router;
