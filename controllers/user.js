/* Have as little dependencies as possible here to make it testable */
const User = require('../models/User');

function createUser(validData, requiredFields, uniquenessVerifiers, passwordHasher) {
  return new Promise(function(resolve, reject) {
    const dataMissing = requiredFields.some(field => !validData[field]);
    if(dataMissing)
      return reject(new Error('Some fields missing, cannot create user'));

    const uniquenessPromises = uniquenessVerifiers.map(func => func());
    Promise.all(uniquenessPromises)
      .then()
      .catch(err => reject(new Error('email or username wasnt unique')));
  });
}

module.exports = {
  createUser
};
