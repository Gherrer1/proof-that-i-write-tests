const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const signupRouteHandler = require('../../../src/routeHandlers/signup');
const { SESSION_COOKIE_NAME } = require('../../../src/config');

describe.only('#Signup route handlers', function() {

  // postSignup(req, res, errors, validData, userController, hasher)
  describe('#postSignup', function() {
    let req, res, errz, validData, userController, hasher;

    beforeEach(function() {
      req = {
        cookies: {}
      };
      res = {
        send(){},
        redirect(){}
      };
      errz = {
        isEmpty() { return true; }
      };
      validData = {
        username: 'midoriya',
        email: 'midoriya@email.com',
        password: '1111111111'
      };
      userController = {
        ensureEmailAndUsernameUnique() { return Promise.resolve([]); }
      };
      hasher = {
        hash() { return Promise.resolve('hashed ;)'); }
      };
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
      errz.isEmpty = function() { return false; }
      const redirectReturnValue = 'batz';
      res.redirect = sinon.stub();
      res.redirect.returns(redirectReturnValue);

      let retVal = signupRouteHandler.postSignup(req, res, errz, validData, userController);
      expect(retVal).to.equal(redirectReturnValue);
      expect(res.redirect.calledOnce).to.be.true;
      expect(res.redirect.calledWith('/signup')).to.be.true;
    });
    it('should call userController.ensureEmailAndUsernameUnique() if no session cookie and no validation errors', function() {
      var expectedEnsureUniquePromisedValue = [];
      userController.ensureEmailAndUsernameUnique = sinon.stub();
      userController.ensureEmailAndUsernameUnique.resolves(expectedEnsureUniquePromisedValue);
      const expectedEmailParam = validData.email;
      const expectedUsernameParam = validData.username;

      signupRouteHandler.postSignup(req, res, errz, validData, userController, hasher);
      expect(userController.ensureEmailAndUsernameUnique.calledOnce).to.be.true;
      expect(userController.ensureEmailAndUsernameUnique.calledWith(expectedEmailParam, expectedUsernameParam)).to.be.true;
    });
    it('should return res.redirect(\'/signup\') with server-error flash message if ensureEmailAndUs..Unique resolves to an error', function(done) {
      userController.ensureEmailAndUsernameUnique = sinon.stub();
      userController.ensureEmailAndUsernameUnique.rejects(new Error('ensureEmailAndUsernameUnique threw an error'));

      res.redirect = sinon.spy();

      signupRouteHandler.postSignup(req, res, errz, validData, userController, hasher);
      setTimeout(() => {
        // TODO: figure out how flash messages work so we can assert that we've set flash message as well
        //       My guess is that it uses cookies
        expect(res.redirect.calledOnce).to.be.true;
        expect(res.redirect.calledWith('/signup')).to.be.true;
        done();
      }, 0);
    });
    it('should call res.redirect(\'/signup\') if username or email isnt unique', function(done) {
      userController.ensureEmailAndUsernameUnique = function() { return Promise.resolve([{}, {}]); };
      res.redirect = sinon.stub();

      signupRouteHandler.postSignup(req, res, errz, validData, userController, hasher)
      setTimeout(() => {
        expect(res.redirect.calledOnce).to.be.true;
        expect(res.redirect.calledWith('/signup')).to.be.true;
        done();
      }, 0);
    });
    it('should call hasher.hash() with password if no session cookie, no validation errors, and username/email are unique', function(done) {
      hasher.hash = sinon.stub();
      const expectedHash = 'hashed ;)';
      const expectedHashParam = validData.password;
      hasher.hash.resolves(expectedHash);

      signupRouteHandler.postSignup(req, res, errz, validData, userController, hasher);
      setTimeout(() => {
        expect(hasher.hash.callCount).to.equal(1);
        expect(hasher.hash.calledOnce).to.be.true;
        expect(hasher.hash.calledWith(expectedHashParam)).to.be.true;
        done();
      }, 0);
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
