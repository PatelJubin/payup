const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  groupname: {
    type: String,
    required: true
  },
  user: [
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
      PaidFor: [
        {
          users: {
            users: Schema.Types.ObjectId,
            ref: "users"
          },
          AmountToPayBack: {
            type: Number
          }
        }
      ]
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Group = mongoose.model("groups", UserSchema);
