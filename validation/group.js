const Validator = require("validator");
const isEmpty = require("./is-empty");
module.exports = function validateGroupInput(data) {
  let errors = {};
  //using our own isempty to check for empty inputs cause validator only handles strings for isempty method
  data.groupname = !isEmpty(data.groupname) ? data.groupname : "";
  data.emails = !isEmpty(data.emails)
    ? data.emails.replace(/\s/g, "").split(",")
    : "";

  data.emails.forEach(email => {
    if (!Validator.isEmail(email)) errors.emails = "Emails is invalid";
  });

  if (!Validator.isAlphanumeric(data.groupname)) {
    errors.groupname = "Group name must be alphanumeric";
  }
  if (!Validator.isLength(data.groupname, { min: 3, max: 40 })) {
    errors.groupname = "Group name must be between 3 and 40 characters";
  }
  if (Validator.isEmpty(data.groupname)) {
    errors.groupname = "Groupname field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
