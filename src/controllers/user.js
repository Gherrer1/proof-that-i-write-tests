const {SALT_ROUNDS} = require('../config');

/* Have as little dependencies as possible here to make it testable */
function createUser(validData, passwordHasher) {
  var model = this.model;
  return new Promise(function(resolve, reject) {
    var user = new model(validData);

    user.save()
    .then(user => resolve(user))
    .catch(err => reject(err));
  });
}

function setModel(model) {
  this.model = model;
}

/**
 * (email, username) -> Promise (user/null or error)
 */
function ensureEmailAndUsernameUnique(email, username) {
  var model = this.model;
  return new Promise(function(resolve, reject) {
    model.find({ $or: [{ email }, { username }] })
    .then(users => resolve(users))
    .catch(reject);
  });
}
/**
 * (email, password, hasher) -> Promise (user/false or error)
 */
function validateLoginCredentials(email, password, hasher) {
  var model = this.model;
  return new Promise(function(resolve, reject) {
    let _user;

    model.findOne({ email })
    .then(user => {
      if(!user) {
        return resolve(false);
      }
      _user = user;
      return hasher.hash(password, SALT_ROUNDS);
    })
    .then(hash => {
      if(hash !== _user.password)
        return resolve(false);
      delete _user.password;
      resolve(_user);
    })
    .catch(err => reject(err));
  });
}

module.exports = {
  setModel,
  createUser,
  ensureEmailAndUsernameUnique,
  validateLoginCredentials
};
