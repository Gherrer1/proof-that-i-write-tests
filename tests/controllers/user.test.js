// const assert = require('chai').expect;
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;

const userController = require('../../controllers/user');
console.log(userController);

describe.only('User Controller', function() {
  describe('create user', function() {
    let validData;
    const requiredFields = require('../../helpers/requiredFields').createUser;
    let uniquenessVerifier;

    beforeEach(function() {
      validData = { fname: 'nomu', username: 'nomu123', email: 'nomu@email.com', password: 'nomu123', passwordConfirmation: 'nomu123' };
      uniquenessVerifier = function(username, email) { return new Promise(function(resolve, reject) { return resolve(true) }) };
    });
    it('should reject promise if any required field is missing in validData', function(done) {
      delete validData.fname;
      userController.createUser(validData, requiredFields)
        .then(user => {
          throw new Error('supposed to reject promise, not resolve promise');
        })
        .catch(err => {
          done();
        });
    });
    it('should call usernameAndEmailUnique on username and email fields', function() {

      throw new Error('red-green refactor');
    });



    it('should reject promise with error if usernameAndEmailUnique returns false', function() {
      const errorMessage = 'Email is already taken';
      uniquenessVerifier = function(params) { // mock
        return new Promise(function(resolve, reject) {
          reject(new Error(errorMessage));
        });
      };
      const promise = userController.createUser(validData, requiredFields, uniquenessVerifier);
      return assert.isRejected(promise, errorMessage);
    });




    it('should call hasher (bcrypt) if usernameAndEmailUnique returns true', function() {
      throw new Error('red-green refactor');
    });
    it('should reject promise if hasher (bcrypt) fails', function() {
      throw new Error('red-green refactor');
    });
    it('should call UserModel if everything goes well', function() {
      throw new Error('red-green refactor');
    });
    it('should resolve promise with user object if everything goes well', function() {
      throw new Error('red-green refactor');
    });
  });
});
