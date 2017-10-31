const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const signupRouteHandler = require('../../../src/routeHandlers/signup');
const { SESSION_COOKIE_NAME } = require('../../../src/config');

describe.only('#Signup route handlers', function() {

  // postSignup(req, res, errors, validData, userController)
  describe('#postSignup', function() {
    let req, res, errz, validData, userController;

    beforeEach(function() {
      req = {
        cookies: {}
      };
      res = {
        send(){},
        redirect(){}
      };
      errz = {};
      validData = {};
      userController = {};
    });

    it('should return res.redirect(\'/dashboard\') if there is a session cookie in the req object', function() {
      req.cookies[SESSION_COOKIE_NAME] = 'abc';
      const redirectReturnValue = 'password';
      res.redirect = sinon.stub();
      res.redirect.returns(redirectReturnValue);

      const retVal = signupRouteHandler.postSignup(req, res, errz, validData, userController);
      expect(res.redirect.calledOnce).to.be.true;
      expect(res.redirect.calledWith('/dashboard')).to.be.true;
      expect(retVal).to.equal(redirectReturnValue);
    });
    it('should return res.redirect(\'/signup\') if there are validation errors', function() {
      throw new Error('red-green refactor');
    });
    it('should call userController.ensureEmailAndUsernameUnique() if no session cookie and no validation errors', function() {
      throw new Error('red-green refactor');
    });
    it('should return res.redirect(\'/signup\') with server-error flash message if ensureEmailAndUs..Unique resovles to an error', function() {
      throw new Error('red-green refactor');
    });
    it('should return res.redirect(\'/signup\') if username or email isnt unique', function() {
      throw new Error('red-green refactor');
    });
    it('should call hasher.hash() if no session cookie, no validation errors, and username/email are unique', function() {
      throw new Error('red-green refactor');
    });
    it('should return res.redirect(\'/signup\') w/ server-error flash message if hasher.hash() resolves to an error', function() {
      throw new Error('red-green refactor');
    });
    it('should call userController.createUser() if no session cookie, no validation errors, and username/email are unique', function() {
      throw new Error('red-green refactor');
    });
    it('should return res.redirect(\'/login\') w/ signup-success flash message if userController.createUser() returns smoothly', function() {
      throw new Error('red-green refactor');
    });
    it('should return res.redirect(\'/signup\') if userController.createUser() resolves to an error', function() {
      throw new Error('red-green refactor');
    });
  });
});
