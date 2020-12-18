const LocalStrategy = require("passport-local").Strategy,
  dbModule = require("../dbModule.js"),
  User = require("../models/User.js");

function initialize(passport) {
  const authenticateUser = async (name, password, done) => {
    const user = await dbModule.findInDBOne(User, name);
    if (user == null) {
      return done(null, false, { message: "No user with that name" });
    }

    try {
      if (password == user.password) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Password incorrect" });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(new LocalStrategy({ usernameField: "name" }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    return done(null, dbModule.findUserWithID(User, id));
  });
}

module.exports = initialize;
