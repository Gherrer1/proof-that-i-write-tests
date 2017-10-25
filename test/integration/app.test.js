const chai = require('chai');
const should = chai.should();
const sinon = require('sinon');
const request = require('supertest');
const app = require('../../app');
const seed = require('../../seed');

describe('Authentication Routes', function() {

  describe('GET /signup', function() {
    it('should return an HTML file with a form field that we can regex');
    it('should redirect to /dashboard it request has a session cookie');
    it('should redirect -> /dashboard -> login if request has an invalid session cookie');
  });

  describe('POST /signup', function() {
    it('should return the /signup HTML page with errors that we can regex');
    it('should return the /signup HTML page with an error if we try to sign up with a taken username/email');
    it('should redirect to /login with 200 status code if everything goes smoothly');
  });
  // beforeEach(function(done) {
  //   seed.connect(function() {
  //     seed.seed()
  //     .then(done, done);
  //   });
  // });

  // beforeEach(function() {
  //   // throw new Error('bitch ass');
  //   // done(new Error('youre a cunt'));
  // });


  // afterEach(function(done) {
  //   seed.disconnect(done);
  // });
});
