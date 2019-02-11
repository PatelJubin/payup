const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  groupname: {
    type: String,
    required: true
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "users"
    }
  ],
  moneyOwed: [
    {
      payee: {
        type: Schema.Types.ObjectId,
        ref: "users"
      },
      AmountPaid: {
        type: Number
      },
      AmountToPayBack: {
        type: Number
      },
      PaidFor: [
        {
          type: Schema.Types.ObjectId,
          ref: "users"
        }
      ]
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Group = mongoose.model("groups", GroupSchema);
