const loginRouteHandlers = require('../../../src/routeHandlers/login');
const sinon = require('sinon');
const expect = require('chai').expect;
const {SESSION_COOKIE_NAME,
       CLIENT_ERROR_COOKIE_NAME,
       SERVER_ERROR_COOKIE_NAME,
       CLIENT_SUCCESS_COOKIE_NAME} = require('../../../src/config');

describe('#Login route handlers', function() {
  describe('#getLogin', function() {
    let req, res;

    beforeEach(function() {
      req = { cookies: {} };
      res = {
        redirect() {},
        render() {}
      };
    });

    it('should return res.redirect("/dashboard") if request comes with a session cookie', function() {
      req.cookies[SESSION_COOKIE_NAME] = '1234';
      const expectedReturnValue = 'scallywag';
      res.redirect = sinon.stub().withArgs('/dashboard').returns(expectedReturnValue);

      const retVal = loginRouteHandlers.getLogin(req, res);
      expect(retVal, 'expected to return res.redirect("/dashboard")').to.equal(expectedReturnValue);
      expect(res.redirect.calledOnce, `did not call res.redirect() once but ${res.redirect.callCount} times`).to.be.true;
      expect(res.redirect.calledWith('/dashboard'), 'Did not call res.redirect() with "/dashboard"').to.be.true;
    });
    it('should return res.render("login") with { success } if request comes with client-success cookie', function() {
      const expectedSuccessMessage = 'You successfully signed up!';
      const expectedReturnValue = 'jimbo';
      req.cookies[CLIENT_SUCCESS_COOKIE_NAME] = expectedSuccessMessage;
      const expectedSecondParamForRender = { success: expectedSuccessMessage };
      res.render = sinon.stub().returns(expectedReturnValue);

      const retVal = loginRouteHandlers.getLogin(req, res);
      expect(retVal, 'Did not return the right res.render()').to.equal(expectedReturnValue);
      expect(res.render.calledOnce, `Did not call res.render() once but ${res.render.callCount} times`).to.be.true;
      expect(res.render.args[0][0], `Did not call res.render() with "login" but with ${res.render.args[0][0]}`).to.equal('login');
      expect(res.render.args[0][1]).to.deep.equal(expectedSecondParamForRender);
    });
    it('should return res.render("login") with { errors } if request comes with client-error cookie', function() {
      const expectedClientError = 'Invalid login credentials';
      const expectedReturnValue = 'cuppycake';
      req.cookies[CLIENT_ERROR_COOKIE_NAME] = expectedClientError;
      const expectedSecondParamForRender = { errors: [expectedClientError] };
      res.render = sinon.stub().returns(expectedReturnValue);

      const retVal = loginRouteHandlers.getLogin(req, res);
      expect(retVal, 'Did not return the right res.render()').to.equal(expectedReturnValue);
      expect(res.render.calledOnce, `Did not call res.render() once but ${res.render.callCount} times`).to.be.true;
      expect(res.render.args[0][0], `Did not call res.render() with "login" but with ${res.render.args[0][0]}`).to.equal('login');
      expect(res.render.args[0][1]).to.deep.equal(expectedSecondParamForRender);
    });
    it('should return res.render("login") with { errors: generic message } if request comes with server-error cookie', function() {
      const expectedReturnValue = 'fkevindurant';
      req.cookies[SERVER_ERROR_COOKIE_NAME] = '1234';
      res.render = sinon.stub().returns(expectedReturnValue);
      const expectedSecondParamForRender = { errors: ['Something went wrong. Please try again'] };

      const retVal = loginRouteHandlers.getLogin(req, res);
      expect(retVal, 'Did not return res.render()').to.equal(expectedReturnValue);
      expect(res.render.calledOnce, `Did not call res.render once but ${res.render.callCount} times`).to.be.true;
      expect(res.render.args[0][0], 'First param for render was not "login"').to.equal('login');
      expect(res.render.args[0][1]).to.deep.equal(expectedSecondParamForRender);
    });
    it('should return res.render("login") with no locals if request comes with no cookies', function() {
      const expectedReturnValue = 'wwwwwwarrrrrriors';
      res.render = sinon.stub().returns(expectedReturnValue);

      const retVal = loginRouteHandlers.getLogin(req, res);
      expect(retVal, 'Did not return res.render()').to.equal(expectedReturnValue);
      expect(res.render.calledOnce).to.be.true;
      expect(res.render.args[0][0], 'First argument to render() was not "login"').to.equal('login');
      expect(res.render.args[0][1], 'Should not pass in a locals object to res.render()').to.be.undefined;
    });
  });
});
