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

function ensureEmailAndUsernameUnique(email, username) {
  var model = this.model;
  return new Promise(function(resolve, reject) {
    // model.find(email, username)
    model.find(email, username)
    .then(users => {
      if(users.length >= 1) {
        return reject();
      }
      return resolve();
    })
    .catch(reject);
  });
}

module.exports = {
  setModel,
  createUser,
  ensureEmailAndUsernameUnique
};