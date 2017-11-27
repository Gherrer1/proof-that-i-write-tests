const loginRouteHandlers = require('../../../src/routeHandlers/login');
const sinon = require('sinon');
const expect = require('chai').expect;
const {SESSION_COOKIE_NAME,
       CLIENT_ERROR_COOKIE_NAME,
       SERVER_ERROR_COOKIE_NAME,
       CLIENT_SUCCESS_COOKIE_NAME} = require('../../../src/config');

describe('#Login route handlers', function() {
  // postLogin(req, res, errors, validData, userController, hasher)
  describe('#postLogin', function() {

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
      throw new Error('red-green refactor');
    });
    it('should return res.render("login") if user isnt already authenticated', function() {
      // var spy = sinon.spy(res, 'render');
      // loginRouteHandlers.ge
      throw new Error('red-green refactor');
    });
  });
});
