/* Have as little dependencies as possible here to make it testable */
const User = require('../models/User');

function createUser(validData, passwordHasher) {
  return new Promise(function(resolve, reject) {
    
  });
}

module.exports = {
  createUser
};
