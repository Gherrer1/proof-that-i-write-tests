const userController = require('../../controllers/user');
const requiredFields = require('../../helpers/requiredFields').createUser;
console.log(userController);

describe.only('User Controller', function() {
  describe('create user', function() {
    it('should reject promise if a required field is missing in validData', function(done) {
      // throw new Error('red-green refactor');
      const validData = { email: 'nomu@email.com', fname: 'nomu', password: 'nomu' };
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
    it('should reject promise if usernameAndEmailUnique returns false', function() {
      throw new Error('red-green refactor');
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
