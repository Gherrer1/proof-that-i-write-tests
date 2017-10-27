const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const sinon = require('sinon');
const request = require('supertest');
const app = require('../../app');
const seed = require('../../seed');
// const config = require('../../config');
const {COOKIE_NAME} = require('../../config');

describe('Authentication Routes', function() {

  beforeEach(function(done) {
    console.log(':)');
    seed.seed()
    .then(done, done);
  });

  afterEach(function(done) {
    console.log(':(');
    done();
  });

  describe('GET /signup', function() {
    it('should redirect to /dashboard if request has a session cookie', function(done){
      // dont worry, itll run into authentication middleware to validate the cookie
      console.log('running test');
      request(app).get('/signup')
        .set('Cookie', [`${COOKIE_NAME}=1234`])
        .expect(302)
        .expect('Location', '/dashboard', done);
    });
    it('should render an HTML file with an error message above the signup form if server-error cookie is present', function(done) {
      console.log('running test');
      const errorMessage = 'Something went wrong'
      request(app).get('/signup')
        .set('Cookie', ['server-error=Something went wrong'])
        .expect(200)
        .expect(/Something went wrong/, done);
    });
    it('should return an HTML file with a form field that we can regex (if no session cookie is present)', function(done){
      console.log('running test');
      request(app).get('/signup')
        .expect(200)
        .expect(/<ul class="signup-errors">/, done);
    });
  });

  describe('GET /login', function() {
    it('should redirect to /dashboard if request has a session cookie', function(done) {
      console.log('running test');
      request(app).get('/signup')
        .set('Cookie', [`${COOKIE_NAME}=1234`])
        .expect(302)
        .expect('Location', '/dashboard', done);
    });
    it('should show a success message if request has a success-flash-message cookie', function(done) {
      console.log('running test');
      request(app).get('/login')
        .set('Cookie', [`success=true`])
        .expect(200)
        .expect(/Successfully signed up!/, done);
    });
    it('should render an HTML file with a form field that we can regex (if no session cookie is present)', function(done) {
        console.log('running test');
        request(app).get('/login')
          .expect(200)
          .expect(/<form action="\/login" method="post">/, done);
    });
  });

  describe('POST /signup', function() {
    it('should redirect to /dashboard if request has a session cookie', function(done) {
      console.log('running test');
      request(app).post('/signup')
        .set('Cookie', [`${COOKIE_NAME}=1234`])
        .expect(302)
        .expect('Location', '/dashboard', done);
    });
    it('should redirect to /signup if request body has invalid parameters without any error messages to discourage bots - browser will have clientside validation', function(done) {
      console.log('running test');
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
          console.log(cookies);
          // TODO: actually check that no cookies were sent, we dont know the shape of the data right now
          done();
        });
    });
    it('should redirect to /signup if username or email in request body are not unique without error messages to discourage bots - clientside will check for uniqueness before allowing client to submit form', function(done) {
      console.log('running test');
      request(app).post('/signup')
        .send({ fname: 'Otherkirishima', email: 'kirishima@email.com', password: '1111111111', username: 'kirishima', passwordConfirmation: '1111111111' })
        .expect(302)
        .expect('Location', '/signup')
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          var cookies = res.headers['set-cookie'];
          console.log(cookies);
          // TODO: actually check that no cookies were returned (cookies that mightve carried error messages)
          done()
        });
    });
    it('should redirect to /login with success message if no session cookie and if request body is all valid, including unique username and email', function(done) {
      console.log('running test');
      request(app).post('/signup')
        .send({ fname: 'Uniqueuser', email: 'uniqueEmail@email.com', password: '1111111111', username: 'uniqueUsername', passwordConfirmation: '1111111111' })
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
});

/**
 * *1 server errors include db operation errors, hashing errors, etc
 */
