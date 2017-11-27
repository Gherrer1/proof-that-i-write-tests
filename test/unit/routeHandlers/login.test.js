const loginRouteHandlers = require('../../../src/routeHandlers/login');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('#Login route handlers', function() {
  // ensureNoValidationErrs(req, res, next, matchedData, validationResult)
  describe('#ensureNoValidationErrs', function() {
  	let req, res, next, matchedData, validationResult;
    const triedUsername = 'triedUsername';
    const matched_data = { email: 'hehe' };

  	beforeEach(function() {
  		validationResult = function() {
  			return {
  				isEmpty() { return false; }
  			}
  		};
      matchedData = function() { return matched_data; };
  		res = { redirect: function() {}, flash: function() {} };
      req = { body: { email: triedUsername } };
      next = function() {};
  	});

  	it('should call res.redirect("/login") if we have validation errors', function() {
  		var spy = sinon.spy(res, 'redirect');
  		loginRouteHandlers.ensureNoValidationErrs(req, res, next, matchedData, validationResult);
  		expect(spy.calledOnce, 'Did not call res.redirect()').to.be.true;
  		expect(spy.calledWith('/login'), 'Did not call res.redirect() with "login"').to.be.true;
  	});
    it('should not call next() if we have validation errors', function() {
      var spy = sinon.spy();
      loginRouteHandlers.ensureNoValidationErrs(req, res, spy, matchedData, validationResult);
      expect(spy.called, 'Should not have called next() if there are validation errors').to.be.false;
    })
    it('should call res.flash("client_error", "Invalid credentials", email) if we have validation errors', function() {
      // Implementation detail, non essential test.
      const spy = sinon.spy(res, 'flash');
      loginRouteHandlers.ensureNoValidationErrs(req, res, next, matchedData, validationResult);
      expect(spy.calledOnce, 'Did not call res.flash()').to.be.true;
      expect(spy.calledWith('client_error', 'Invalid credentials', triedUsername), 'Did not call res.flash with expected parameters').to.be.true;
    });
    it('should set req.body to validData if there are no errors', function validDataAssignment() {
      validationResult = function() { return { isEmpty() { return true; } } };
      loginRouteHandlers.ensureNoValidationErrs(req, res, next, matchedData, validationResult);
      expect(req.body).to.deep.equal(matched_data);
    });
    it('should call next() if no validation errors', function() {
      validationResult = function() { return { isEmpty() { return true; } } }; // returns an obj with a method that returns true
      var spy = sinon.spy();
      loginRouteHandlers.ensureNoValidationErrs(req, res, spy, matchedData, validationResult);
      expect(spy.calledOnce, 'next() not called once').to.be.true;
    });
  });
  describe('#getLogin', function() {
    let req, res;

    beforeEach(function() {
      req = { locals: {}, isAuthenticated() { return false; } };
      res = {
        redirect() {},
        render() {}
      };
    });

    it('should return res.redirect("/dashboard") if user is already logged in', function() {
      req.isAuthenticated = sinon.stub().returns(true);
      var spy = sinon.spy(res, 'redirect');
      loginRouteHandlers.getLogin(req, res);

      expect(req.isAuthenticated.calledOnce, 'Did not check if user is authenticated').to.be.true;
      expect(res.redirect.calledOnce, 'Did not call res.redirect()').to.be.true;
      expect(res.redirect.calledWith('/dashboard'), 'Did not call res.redirect() with "/dashboard"').to.be.true;
    });
    it('should return res.redirect("/dashboard") if user is already logged in even if request came with flash message', function() {
      req.locals.flashMessage = { type: 'Success', text: 'Success' };
      req.isAuthenticated = sinon.stub().returns(true);
      var spy = sinon.spy(res, 'redirect');
      loginRouteHandlers.getLogin(req, res);

      expect(req.isAuthenticated.calledOnce, 'Did not check if user is authenticated').to.be.true;
      expect(res.redirect.calledOnce, 'Did not call res.redirect()').to.be.true;
      expect(res.redirect.calledWith('/dashboard'), 'Did not call res.redirect() with "/dashboard"').to.be.true;
    });
    it('should return res.render("login") if user isnt already authenticated', function() {
      var spy = sinon.spy(res, 'render');
      loginRouteHandlers.getLogin(req, res);

      expect(res.render.calledOnce, 'Did not call res.render()').to.be.true;
      expect(res.render.calledWith('login'), 'Did not call res.render() with "login"').to.be.true;
    });
  });
  // handleAuthenticationResult(req, res, err, user, info)
  describe('#handleAuthenticationResult', function() {
    let req, res, err, user, info;
    beforeEach(function() {
      req = { login(user, cb) { cb(new Error()); } }
    });
    it('[implementation] should call res.flash("server_error", "Something went wrong", req.body.email) if err is truthy', function() {
      throw new Error('red-green refactor');
    });
    it('should call res.redirect("/login") if err is truthy', function() {
      throw new Error('red-green refactor');
    });
    it('[implementation] should call res.flash("client_error", "Invalid credentials", req.body.email) if user is false', function() {
      throw new Error('red-green refactor');
    });
    it('should call res.redirect("/login") if user is false', function() {
      throw new Error('red-green refactor');
    });
    it('[implementation] should call req.login(user, cb) if no err and user is truthy', function() {
      throw new Error('red-green refactor');
    });
    it('[implementation] should call res.flash("server_error", "Something went wrong", req.body.email) if req.login passes err to callback', function() {
      throw new Error('red-green refactor');
    });
    it('should call res.redirect("/login") if req.login passes err to callback', function() {
      throw new Error('red-green refactor');
    });
    it('should call res.redirect("/dashboard") if req.login doesnt pass err to callback', function() {
      throw new Error('red-green refactor');
    });
  });
});
