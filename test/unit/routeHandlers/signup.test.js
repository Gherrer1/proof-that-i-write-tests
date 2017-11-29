const sinon = require('sinon');
const expect = require('chai').expect;
const signupRouteHandler = require('../../../src/routeHandlers/signup');

describe('#Signup route handlers', function() {
  // postSignup(req, res, errors, validData, userController, hasher)
  describe('#postSignup', function() {
    let req, res, errz, validData, userController, hasher;

    beforeEach(function() {
      req = {};
      res = { redirect(){}, flash(){} };
      errz = { isEmpty() { return true; } };
      validData = {
        fname: 'Midoriya',
        username: 'midoriya',
        email: 'midoriya@email.com',
        password: '1111111111'
      };
      userController = {
        ensureEmailAndUsernameUnique() { return Promise.resolve([]); },
        createUser(validData) { return Promise.resolve({}); }
      };
      hasher = {
        hash() { return Promise.resolve('hashed ;)'); }
      };
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
    it('[implementation] should call userController.ensureEmailAndUsernameUnique() if no validation errors', function() {
      var expectedEnsureUniquePromisedValue = [];
      userController.ensureEmailAndUsernameUnique = sinon.stub();
      userController.ensureEmailAndUsernameUnique.resolves(expectedEnsureUniquePromisedValue);
      const expectedEmailParam = validData.email;
      const expectedUsernameParam = validData.username;

      signupRouteHandler.postSignup(req, res, errz, validData, userController, hasher);
      expect(userController.ensureEmailAndUsernameUnique.calledOnce).to.be.true;
      expect(userController.ensureEmailAndUsernameUnique.calledWith(expectedEmailParam, expectedUsernameParam)).to.be.true;
    });
    it('[implementation] should return res.redirect(\'/signup\') with server_error flash message if ensureEmailAndUs..Unique resolves to an error', function(done) {
      userController.ensureEmailAndUsernameUnique = sinon.stub().rejects(new Error('ensureEmailAndUsernameUnique threw an error'));
      res.redirect = sinon.spy();
      res.flash = sinon.spy();

      signupRouteHandler.postSignup(req, res, errz, validData, userController, hasher);
      setTimeout(() => {
        expect(res.redirect.calledOnce).to.be.true;
        expect(res.redirect.calledWith('/signup')).to.be.true;
        expect(res.flash.calledOnce, 'Did not call res.flash()').to.be.true;
        expect(res.flash.args[0], 'Did not call res.flash() with expected params').to.deep.equal(['server_error', 'Something went wrong. Please try again']);
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
    it('[implementation] should call hasher.hash() with password if no validation errors, and username/email are unique', function(done) {
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
    it('[implementation] should call res.redirect(\'/signup\') w/ server_error flash message if hasher.hash() rejects with an error', function(done) {
      hasher.hash = sinon.stub().rejects(new Error('hasher.hash threw an error'));

      res.redirect = sinon.spy();
      res.flash = sinon.spy();

      signupRouteHandler.postSignup(req, res, errz, validData, userController, hasher);
      setTimeout(() => {
        expect(res.redirect.calledOnce).to.be.true;
        expect(res.redirect.calledWith('/signup')).to.be.true;
        expect(res.flash.calledOnce, 'Did not call res.flash()').to.be.true;
        expect(res.flash.args[0], 'Did not call res.flash() with appropriate params').to.deep.equal(['server_error', 'Something went wrong. Please try again']);
        done();
      }, 0);
    });
    it('[implementation] should call userController.createUser() with validData including hashed password if no validation errors, and username/email are unique, and password hashing goes well', function(done) {
      userController.createUser = sinon.spy();
      var expectedCreateUserParam = {
        fname: validData.fname,
        username: validData.username,
        email: validData.email,
        password: 'hashed ;)',
      }
      signupRouteHandler.postSignup(req, res, errz, validData, userController, hasher);
      setTimeout(() => {
        expect(userController.createUser.calledOnce, `userController.createUser was called ${userController.createUser.callCount} times, not once`).to.be.true;
        expect(userController.createUser.args[0][0]).to.deep.equal(expectedCreateUserParam);
        done();
      }, 0);
    });
    it('[implementation] should return res.redirect(\'/login\') w/ signup_success flash message if userController.createUser() returns smoothly', function(done) {
      res.redirect = sinon.spy();
      res.flash = sinon.spy();
      signupRouteHandler.postSignup(req, res, errz, validData, userController, hasher);
      setTimeout(() => {
        expect(res.redirect.calledOnce, `res.redirect called ${res.redirect.callCount} times, not once`).to.be.true;
        expect(res.redirect.calledWith('/login'), `res.redirect called with ${res.redirect.args[0][0]} not with /login`).to.be.true;
        expect(res.flash.calledOnce, 'Did not call res.flash()').to.be.true;
        expect(res.flash.args[0], 'Did not call res.flash() with signup_success message').to.deep.equal(['signup_success', 'You successfully signed up!']);
        done();
      }, 0);
    });
    it('[implementation] should call res.redirect(\'/signup\') w/ server_error flash message if userController.createUser() rejects with an error', function(done) {
      userController.createUser = sinon.stub();
      userController.createUser.rejects(new Error('userController.createUser() threw an error'));
      res.redirect = sinon.spy();
      res.flash = sinon.spy();

      signupRouteHandler.postSignup(req, res, errz, validData, userController, hasher)
      setTimeout(() => {
        expect(res.flash.calledOnce, 'Did not call res.flash()').to.be.true;
        expect(res.flash.args[0], 'Did not call res.flash() with server_error params').to.deep.equal(['server_error', 'Something went wrong. Please try again']);
        expect(res.redirect.calledOnce).to.be.true;
        expect(res.redirect.calledWith('/signup'), 'res.redirect not called with /signup but with ' + res.redirect.args[0][0]).to.be.true;
        done();
      });
    });
  });

  // getSignup(req, res)
  describe('#getSignup', function() {
    let req, res;

    beforeEach(function() {
      req = {};
      res = { render() {} };
    });

    /* this should only ever happen with legit server errors, no client errors - clientside JS will handle those*/
    it('should return res.render("/signup")', function() {
      const expectedReturnValue = 'tyrelliot';
      res.render = sinon.stub().returns(expectedReturnValue);
      const retVal = signupRouteHandler.getSignup(req, res);

      expect(retVal, 'Expected function to return res.render()').to.equal(expectedReturnValue);
      expect(res.render.calledOnce, `res.render() not called once but ${res.render.callCount} times`).to.be.true;
      expect(res.render.args[0][0], `res.render()s first argument was not "signup" like expected but ${res.render.args[0][0]}`).to.equal('signup');
    });
  });
});
