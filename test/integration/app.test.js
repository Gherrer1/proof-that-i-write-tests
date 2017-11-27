const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const sinon = require('sinon');
const request = require('supertest');
const app = require('../../src/app');
const seed = require('../../seed');
const {SESSION_COOKIE_NAME,
       SERVER_ERROR_COOKIE_NAME,
       CLIENT_ERROR_COOKIE_NAME,
       CLIENT_SUCCESS_COOKIE_NAME} = require('../../src/config');
const debug = require('debug')('test-order');

describe.only('#Authentication_Routes', function() {

  beforeEach(function(done) {
    debug(':)');
    seed.seed()
    .then(done, done);
  });

  afterEach(function(done) {
    debug(':(');
    done();
  });

  describe('new [GET /login]', function() {
    it('should redirect to /dashboard if user is already logged in', function() {
      throw new Error('Come back to - when POST /login is solidified');
    });
    it('should show client_error flash message on page if flash cookie contains client error message, also flash cookie should be cleared', function(done) {
      request(app).get('/login')
        .set('Cookie', ['cookie_flash_message=%7B%22type%22%3A%22client_error%22%2C%22text%22%3A%22Invalid%20Credentials%22%7D'])
        .expect(200)
        .expect(/class="client_error"/)
        .expect(/Invalid Credentials/)
        .end(function(err, res) {
          if(err)
            return done(err);
          expect(res.headers['set-cookie'][0]).to.match(/cookie_flash_message=.+01 Jan 1970/); // this signifies that cookie has been cleared
          done();
        });
    });
  	it('should show server_error flash message on page if flash cookie includes server-error, and should clear cookie', function(done) {
      request(app).get('/login')
        .set('Cookie', ['cookie_flash_message=%7B%22type%22%3A%22server_error%22%2C%22text%22%3A%22Something%20went%20wrong%22%7D'])
        .expect(200)
        .expect(/class="server_error"/)
        .expect(/Something went wrong/)
        .end(function(err, res) {
          if(err)
            return done(err);
          expect(res.headers['set-cookie'][0]).to.match(/cookie_flash_message=.+01 Jan 1970/); // this signifies that cookie has been cleared
          done();
        });
    });
  	it('should show signup_success flash message on page if flash cookie includes signup success message, and cookie should be cleared', function(done) {
      request(app).get('/login')
        .set('Cookie', ['cookie_flash_message=%7B%22type%22%3A%22signup_success%22%2C%22text%22%3A%22Sign%20up%20successful!%22%7D'])
        .expect(200)
        .expect(/class="signup_success"/)
        .expect(/Sign up successful!/)
        .end(function(err, res) {
          if(err)
            return done(err);
          expect(res.headers['set-cookie'][0]).to.match(/cookie_flash_message=.+01 Jan 1970/); // this signifies that cookie has been cleared
          done();
        });
    });
  	it('should show login page without any messages if no flash message cookie sent', function(done) {
      request(app).get('/login')
        .expect(200)
        .expect(/<form action="\/login" method="post">/, done);
    });
  });

  describe('[GET /signup]', function() {
    it('should redirect to /dashboard if request has a session cookie', function(done){
      // dont worry, itll run into authentication middleware to validate the cookie
      debug('running test');
      request(app).get('/signup')
        .set('Cookie', [`${SESSION_COOKIE_NAME}=1234`])
        .expect(302)
        .expect('Location', '/dashboard', done);
    });
    it('should render an HTML file with an error message above the signup form if server-error cookie is present', function(done) {
      debug('running test');
      const errorMessage = 'Something went wrong'
      request(app).get('/signup')
        .set('Cookie', [`${SERVER_ERROR_COOKIE_NAME}=${errorMessage}`])
        .expect(200)
        .expect(/<li>Something went wrong<\/li>/, done);
    });
    it('should return an HTML file with a form field that we can regex (if no cookies present)', function(done){
      debug('running test');
      request(app).get('/signup')
        .expect(200)
        .expect(/<form action="\/signup" method="POST">/, done);
    });
  });

  describe('[POST /signup]', function() {
    it('should redirect to /dashboard if request has a session cookie', function(done) {
      debug('running test');
      request(app).post('/signup')
        .set('Cookie', [`${SESSION_COOKIE_NAME}=1234`])
        .expect(302)
        .expect('Location', '/dashboard', done);
    });
    it('should redirect to /signup if request body has invalid parameters without any error messages to discourage bots - browser will have clientside validation', function(done) {
      debug('running test');
      request(app).post('/signup')
        .send({ fname: 'Tester', email: 'invalid email lol', also: 'many fields are missing LOL' })
        .expect(302)
        .expect('Location', '/signup')
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          // heres where we check that no cookies were sent
          var cookies = res.headers['set-cookie'];
          debug(cookies);
          // TODO: actually check that no cookies were sent, we dont know the shape of the data right now
          done();
        });
    });
    it('should redirect to /signup if username or email in request body are not unique without error \n\tmessages to discourage bots - clientside will check for uniqueness before allowing client to submit form', function(done) {
      debug('running test');
      request(app).post('/signup')
        .send({ fname: 'Otherkirishima', email: 'kirishima@email.com', password: '1111111111', username: 'kirishima', passwordConfirmation: '1111111111' })
        .expect(302)
        .expect('Location', '/signup')
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          var cookies = res.headers['set-cookie'];
          debug(cookies);
          // TODO: actually check that no cookies were returned (cookies that mightve carried error messages)
          done()
        });
    });
    it('should redirect to /login with success message if no session cookie and if request body is all valid, including unique username and email', function(done) {
      debug('running test');
      request(app).post('/signup')
        .send({ fname: 'Uniqueuser', email: 'uniqueEmail@email.com', password: '1111111111', username: 'uniqueUname', passwordConfirmation: '1111111111' })
        .expect(302)
        .expect('Location', '/login')
        .end(function(err, res) {
          // TODO: make sure a flash message cookie is present
          if(err) {
            return done(err);
          }
          done();
        });
    });
    it('should redirect to /signup with error message via cookie (something went wrong) for server errors (*1)');
  });

  describe.skip('[POST /login]', function() {
    // might not need to do this - since passport.session() will automatically fill in req.user if your cookie is valid, we can go straight to dashboard
    // so when i say might not need to do this, what I really mean is that we might not need to send to authorization middleware
    // however, if we DO have a cookie and no req.user, that means our sessionID wasnt valid... do we have to manually delete it?
    it('should redirect to /dashboard if request has a session cookie', function(done) {
      debug('running test');
      request(app).post('/login')
        .set('Cookie', [`${SESSION_COOKIE_NAME}=1234`])
        .expect(302)
        .expect('Location', '/dashboard', done);
    });
    it('should redirect to /login with client-error cookie and username-you-just-tried cookie if data is invalid - as in simply doesnt fit the requirements used for signup', function(done) {
      debug('running test');
      request(app).post('/login')
        .send({ email: 'a', password: '1' })
        .expect(302)
        .expect('Location', '/login')
        .end(function(err, res) {
          if(err)
            return done(err);
          // TODO: make sure invalid-params cookie sent
          const cookies = res.headers['set-cookie'];
          const expectedCookies = { rey: true };
          expect(cookies).to.deep.equal(expectedCookies);
          done();
        });
    });
    it('should redirect to /login with server-error cookie/flash message if there are server errors'); // find out how to mock this
    it('if no session cookie, valid params, no server errors, should give session cookie and redirect to /dashboard', function(done) {
      request(app).post('/login')
        .send({ email: 'sato@email.com', password: '1111111111'})
        .expect(302)
        .expect('Location', '/dashboard')
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          // TODO: inspect cookies and make sure there's a session cookie
          const cookies = res.headers['set-cookie'];
          const expectedCookies = { chewbacca: true };
          expect(cookies).to.deep.equal(expectedCookies);
          done();
        });
    });
    it('if no session cookie but invalid credentials, should redirect to /login and should NOT be given a session cookie, should be given client-error cookie and username-you-just-tried cookie', function(done) {
      request(app).post('/login')
        .send({ email: 'sato@email.com', password: '1111111111' })
        .expect(302)
        .expect('Location', '/login')
        .end(function(err, response) {
          if(err)
            return done(err);
          // TODO:
          // assert that we get the cookies we're expecting and nothing more
          const expectedCookies = { bro: 'haha' }; // dummy, just wanna see expected/actual
          const cookies = response.headers['set-cookie'];
          expect(cookies).to.deep.equal(expectedCookies);
          done();
        });
    });
  });
});

/**
 * *1 server errors include db operation errors, hashing errors, etc
 */
