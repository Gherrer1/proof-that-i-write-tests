const bodyParser              = require('body-parser');
const express                 = require('express');
const chai                    = require('chai');
const expect                  = chai.expect;
const request                 = require('supertest');
const { signupValidators }    = require('../../src/validators');
const { validationResult }    = require('express-validator/check');
const { matchedData }         = require('express-validator/filter');
const vConstants              = require('../../src/validators/validatorConstants');
const debug                   = require('debug')('validator-integration-tests');

// Automate testing that the validators work
describe.only('#Signup Validators', function() {
  // create a fake app
  let app = express();
  app.use(bodyParser.json());
  app.post('/signupTest', signupValidators, function(req, res) {
    const errors = validationResult(req);
    const validData = matchedData(req);
    const sentData = req.body;
    // console.log(`sentData:`, sentData);

    const json = { validData, sentData };
    if(!errors.isEmpty()) {
      json.errors = errors.mapped();
    }

    res.json(json);
  });

  let data = {
    fname: 'jerry',
    email: 'email@email.com',
    username: 'jerry',
    password: 'mypassword',
    passwordConfirmation: 'mypassword'
  };

  beforeEach(function() {
    data = {
      fname: 'jerry',
      email: 'email@email.com',
      username: 'jerry',
      password: 'mypassword',
      passwordConfirmation: 'mypassword'
    };
  });

  describe('#Sanitization', function() {
    it('should lowercase usernames and emails ONLY', function(done) {
      data = { fname: 'JERRY', username: 'JERRY', email: 'EMAIL@EMAIL.COM', password: '   MYPASSWORD   ', passwordConfirmation: '   MYPASSWORD   ' };
      const expectedValidData = { fname: data.fname, username: 'jerry', email: 'email@email.com', password: data.password, passwordConfirmation: data.passwordConfirmation };

      done(new Error('red-green refactor'));
    });

    it('fname, username, and email (automatically) should be trimmed. Password/Confirmation should not', function(done) {
      data.fname = '   jerry   ';
      data.username = '    jerry    ';
      data.email = '  email@email.com   ';
      data.password = '   mypassword   ';
      data.passwordConfirmation = '   mypassword   ';
      const expectedValidData = {
        fname: 'jerry', username: 'jerry', email: 'email@email.com', password: data.password, passwordConfirmation: data.passwordConfirmation
      }
      request(app).post('/signupTest')
        .send(data)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          // console.log(res.body);
          // expect(res.body.validData.fname).to.equal('hehe');
          expect(res.body.validData).to.deep.equal(expectedValidData);
          done();
        });
    });
  });

  describe('#Validation', function() {
    describe('#Required Fields', function() {
      it('should contain fname, username, email, password, or passwordConfirmation in errors if ANY of those fields are 0 characters long', function(done) {
        data = {
          fname: '',
          username: '',
          email: '',
          password: '',
          passwordConfirmation: ''
        };
        request(app).post('/signupTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors.fname).to.exist;
            expect(res.body.errors.username).to.exist;
            expect(res.body.errors.email).to.exist;
            expect(res.body.errors.password).to.exist;
            expect(res.body.errors.passwordConfirmation).to.exist;
            done();
          });
        // done(new Error('red-green refactor'));
      });

      it('should contain fname, username, email, password, or passwordConfirmation in errors if ANY of those fields are missing', function(done) {
        request(app).post('/signupTest')
        // dont send any data
          .end(function(err, res) {
            if(err)
              return done(err);
            // nothing should be valid btw
            expect(res.body.validData).to.deep.equal({});
            expect(res.body.errors.email).to.exist;
            expect(res.body.errors.email.msg).to.equal('Email missing');
            expect(res.body.errors.fname).to.exist;
            expect(res.body.errors.fname.msg).to.equal('First name missing');
            expect(res.body.errors.username).to.exist;
            expect(res.body.errors.username.msg).to.equal('Username missing');
            expect(res.body.errors.password).to.exist;
            expect(res.body.errors.password.msg).to.equal('Password missing');
            expect(res.body.errors.passwordConfirmation).to.exist;
            expect(res.body.errors.passwordConfirmation.msg).to.equal('Password confirmation missing');
            done();
          });
      });
    });

    describe('#Length Mins/Maxs', function() {

      it('should include fname in errors with message \n\t    "First name cannot be greater than 20 characters" \n\t    if it is greater than 20 characters long', function(done) {
        done(new Error('red-green refactor'));
      });

      it('should include username in errors with message \n\t    "Username must be between 5 and 12 characters" \n\t    if it isnt between 5 <= chars <= 12 characters long', function(done) {
        done(new Error('red-green refactor'));
      });

      it('should include email in errors with message \n\t    "Email cannot be greater than 40 characters" \n\t     if its greater than 40 characters long', function(done) {
        done(new Error('red-green refactor'));
      });

      it('should include password/confirmation in errors with message \n\t    "Password/confirmation must be between 8 and 100 characters" \n\t     if its not between 8 <= chars <= 100', function(done) {
        done(new Error('red-green refactor'));
      });
    });

    describe('#Regex', function() {
      it('should include fname in errors with message \n\t    "Name cannot contain a number or anomolous symbols" \n\t    if it contains a number or any of these characters: !@#$%^&*?/\\[]{}()<>+=;:', function(done) {
        done(new Error('red-green refactor'));
      });

      it('should include username in errors if it isnt strictly alphanumeric with message \n\t    "Username must begin with letter and can only contain letters numbers and periods" \n\t    with the exception of periods (.)', function(done) {
        done(new Error('red-green refactor'));
      });
    });

    describe('#Misc', function() {
      it('should include passwordConfirmation in errors with message "Password confirmation does not match password" if it doesnt equal password', function(done) {
        done(new Error('red-green refactor'));
      });

      it('should include email in errors with message "Invalid email" if it isnt an email', function(done) {
        data.email = 'jerry';
        request(app).post('/signupTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors.email).to.exist;
            expect(res.body.errors.email.msg).to.equal('Invalid email');
            done();
          });
      });
    });
  });
});
