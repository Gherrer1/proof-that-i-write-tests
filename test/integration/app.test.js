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
    it('should return an HTML file with a form field that we can regex', function(done){
      console.log('running test');
      request(app).get('/signup')
        .expect(200)
        .expect(/<ul class="signup-errors">/, done);
    });
    it('should redirect to /dashboard if request has a session cookie', function(done){
      console.log('running test');
      request(app).get('/signup')
        .set('Cookie', [`${COOKIE_NAME}=1234`])
        .expect(302)
        .expect('Location', '/dashboard', done);
    });
    it('should redirect -> /dashboard -> login if request has an invalid session cookie', function(done){
      console.log('running test');
      request(app).get('/signup')
        .set('Cookie', [`${COOKIE_NAME}=1234`])
        .expect(302)
        .expect('Location', '/dashboard', function() {
          request(app).get('/dashboard')
            .set('Cookie', [`${COOKIE_NAME}=1234`])
            .expect(302)
            .expect('Location', '/login', function() {
              request(app).get('/login')
                .expect(200)
                .expect(/<h1>Login Page<\/h1>/, done)
            });
        });
      // done(new Error('bitch ass'));
    });
  });

  describe('POST /signup', function() {
    it('should return the /signup HTML page with errors that we can regex', function(done){
      console.log('running test');
      request(app).post('/signup')
        .send({ fname: 'jerry', email: 'jerry@email.com' })
        .expect(302)
        // .expect(/<ul class="signup-errors"><li>blahh<\/li>/)
        .expect('Location', '/signup', done); // where its being redirected to
        // supertest by default doesnt follow the redirect which is why we need
      // done(new Error('bitch ass'));
    });
    it('should return the /signup HTML page with an error if we try to sign up with a taken username/email', function(done){
      console.log('running test');
      done(new Error('bitch ass'));
    });
    it('should redirect to /login with 200 status code if everything goes smoothly', function(done){
      console.log('running test');
      done(new Error('bitch ass'));
    });
  });
});
