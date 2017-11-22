const passport        = require('passport');
const LocalStrategy   = require('passport-local').Strategy;
const UserController  = require('../controllers/user');

passport.use(new LocalStrategy({ usernameField: 'email' }, function _verify(username, password, done) {
  const email = username;
  userController.validateLoginCredentials(email, password, require('bcrypt'))
  .then(user => done(null, user))
  .catch(err => done(err));
}));

passport.serializeUser(function serialize(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function deserialize(id, done) {
  userController.findById(id)
  .then(user => done(null, user))
  .catch(err => done(err));
});

module.exports = passport;
