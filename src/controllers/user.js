/* Have as little dependencies as possible here to make it testable */
function createUser(validData, passwordHasher) {
  var model = this.model;
  return new Promise(function(resolve, reject) {
    passwordHasher.hash(validData.password)
    .then(hash => {
      validData.password = hash;
      var user = new model(validData);
      return user.save();
    })
    .then(user => {
      resolve(user);
    })
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

module.exports = {
  setModel,
  createUser,
  ensureEmailAndUsernameUnique
};
