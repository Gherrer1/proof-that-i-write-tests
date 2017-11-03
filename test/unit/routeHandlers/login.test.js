const loginRouteHandlers = require('../../../src/routeHandlers/login');

describe.only('#Login route handlers', function() {
  describe('#getLogin', function() {
    it('should return res.redirect("/dashboard") if request comes with a session cookie', function() {
      throw new Error('red-green refactor');
    });
    it('should return res.render("login") with { title, errors } if request comes with client-error cookie', function() {
      throw new Error('red-green refactor');
    });
    it('should return res.render("login") with { title, errors: generic message } if request comes with server-error cookie', function() {
      throw new Error('red-green refactor');
    });
    it('should return res.render("login") with { title, errors: [] } if request comes with no cookies', function() {
      throw new Error('red-green refactor');
    });
  });
});
