const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  MoneyOwedToMe: {
    type: Number
  },
  MoneyOwedToOthers: {
    type: Number
  },
  groupsID: [{ type: Schema.Types.ObjectId, ref: "groups" }]
});

module.exports = User = mongoose.model("users", UserSchema);
