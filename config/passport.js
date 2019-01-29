const JwtStrategy = require("passport-jwt").Strategy;
const mongoose = require("mongoose");
const User = mongoose.model("users");
const keys = require("../config/keys");

var cookieExtractor = function(req) {
  var token = null;
  if (req && req.cookies) token = req.cookies["jwt"];
  return token;
};

const opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      User.findById(jwt_payload.id)
        .then(user => {
          if (user) {
            return done(null, user);
          }
          return done(null, false);
        })
        .catch(err => console.log(err));
    })
  );
};
