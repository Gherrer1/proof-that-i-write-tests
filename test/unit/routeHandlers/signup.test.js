const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const signupRouteHandler = require('../../../src/routeHandlers/signup');
const { SESSION_COOKIE_NAME,
        SERVER_ERROR_COOKIE_NAME } = require('../../../src/config');

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
        isEmpty() { return true; },
        mapped() {}
      };
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
    it('should call res.redirect(\'/signup\') w/ server-error flash message if hasher.hash() rejects with an error', function(done) {
      hasher.hash = sinon.stub();
      hasher.hash.rejects(new Error('hasher.hash threw an error'));

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
    it('should call userController.createUser() with validData including hashed password if no session cookie, no validation errors, and username/email are unique, and password hashing goes well', function(done) {
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
    it('should return res.redirect(\'/login\') w/ signup-success flash message if userController.createUser() returns smoothly', function(done) {
      res.redirect = sinon.spy();

      signupRouteHandler.postSignup(req, res, errz, validData, userController, hasher);
      setTimeout(() => {
        // TODO: figure out how flash messages work so we can assert that we've set flash message as well
        //       My guess is that it uses cookies
        expect(res.redirect.calledOnce, `res.redirect called ${res.redirect.callCount} times, not once`).to.be.true;
        expect(res.redirect.calledWith('/login'), `res.redirect called with ${res.redirect.args[0][0]} not with /login`).to.be.true;
        done();
      }, 0);
    });
    it('should call res.redirect(\'/signup\') w/ flash message if userController.createUser() rejects with an error', function(done) {
      userController.createUser = sinon.stub();
      userController.createUser.rejects(new Error('userController.createUser() threw an error'));

      res.redirect = sinon.spy();

      signupRouteHandler.postSignup(req, res, errz, validData, userController, hasher)
      setTimeout(() => {
        // TODO: figure out how flash messages work so we can assert that we've set flash message as well
        //       My guess is that it uses cookies
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
      req = {
        cookies: {}
      };
      res = {
        redirect() {},
        render() {}
      };
    });

    it('should return res.redirect("/dashboard") if request comes with a session cookie', function() {
      req.cookies[SESSION_COOKIE_NAME] = '1234';
      const expectedReturnValue = 'secrethehe'
      res.redirect = sinon.stub().returns(expectedReturnValue);
      const retVal = signupRouteHandler.getSignup(req, res);
      expect(retVal).to.equal(expectedReturnValue);
      expect(res.redirect.calledOnce, 'res.redirect() not called once').to.be.true;
      expect(res.redirect.calledWith('/dashboard'), 'res.redirect() not called with "/dashboard"').to.be.true;
    });
    /* this should only ever happen with legit server errors, no client errors - clientside JS will handle those*/
    it('should return res.render("/signup") with {title, errors} string passed in if request comes with a server-error cookie', function() {
      const expectedReturnValue = 'darlenesGUNN';
      const errorCookieValue = 'Hashing failed';
      const expectedRenderParams = { title: 'Signup', errors: [errorCookieValue] };

      res.render = sinon.stub().returns(expectedReturnValue);
      req.cookies[SERVER_ERROR_COOKIE_NAME] = errorCookieValue;
      var retVal = signupRouteHandler.getSignup(req, res);

      expect(retVal).to.equal(expectedReturnValue);
      expect(res.render.calledOnce, `res.render() not called once but ${res.render.callCount} times`).to.be.true;
      expect(res.render.args[0][0], `res.render()s first argument was not "signup" but ${res.render.args[0][0]}`).to.equal('signup');
      expect(res.render.args[0][1]).to.deep.equal(expectedRenderParams);
    });
    it('should return res.render("/signup") with {title, errors: []} passed in if request comes with no cookies', function() {
      const expectedReturnValue = 'tyrelliot';
      const expectedRenderParams = { title: 'Signup', errors: [] };
      res.render = sinon.stub().returns(expectedReturnValue);
      const retVal = signupRouteHandler.getSignup(req, res);

      expect(retVal, 'Expected function to return res.render()').to.equal(expectedReturnValue);
      expect(res.render.calledOnce, `res.render() not called once but ${res.render.callCount} times`).to.be.true;
      expect(res.render.args[0][0], `res.render()s first argument was not "signup" like expected but ${res.render.args[0][0]}`).to.equal('signup');
      const secondRenderArg = res.render.args[0][1];
      expect(secondRenderArg, `Expected res.render()s second argument to deep equal ...`).to.deep.equal(expectedRenderParams);
    });
  });
});
