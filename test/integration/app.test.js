const chai = require('chai');
const should = chai.should();
const sinon = require('sinon');
const request = require('supertest');
const app = require('../../app');
const seed = require('../../seed');

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
    it('should return an HTML file with a form field that we can regex', function(done){console.log('running test');done()});
    it('should redirect to /dashboard it request has a session cookie', function(done){console.log('running test');done()});
    it('should redirect -> /dashboard -> login if request has an invalid session cookie', function(done){console.log('running test');done()});
  });

  describe('POST /signup', function() {
    it('should return the /signup HTML page with errors that we can regex', function(done){console.log('running test');done()});
    it('should return the /signup HTML page with an error if we try to sign up with a taken username/email', function(done){console.log('running test');done()});
    it('should redirect to /login with 200 status code if everything goes smoothly', function(done){console.log('running test');done()});
  });
});
