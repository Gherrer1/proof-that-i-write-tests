/* Have as little dependencies as possible here to make it testable */
const User = require('../models/User');

function createUser(validData, requiredFields, uniquenessVerifiers, passwordHasher) {
  return new Promise(function(resolve, reject) {
    const dataMissing = requiredFields.some(field => !validData[field]);
    if(dataMissing)
      return reject(new Error('Some fields missing, cannot create user'));

    uniquenessVerifiers({ email: validData.email, username: validData.username })
      .then(function hashPassword() {
        return passwordHasher(validData.password)
      })
      .then()
      .catch(err => reject(err));
  });
}

module.exports = {
  createUser
};
