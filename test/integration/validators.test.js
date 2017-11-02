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
            expect(res.body.errors.fname.msg).to.equal('First name missing');
            expect(res.body.errors.username).to.exist;
            // expect(res.body.errors.username.msg).to.equal('Username missing'); no longer applicable
            expect(res.body.errors.email).to.exist;
            expect(res.body.errors.email.msg).to.equal('Email missing');
            expect(res.body.errors.password).to.exist;
            // expect(res.body.errors.password.msg).to.equal('Password missing'); no longer applicable
            expect(res.body.errors.passwordConfirmation).to.exist;
            expect(res.body.errors.passwordConfirmation.msg).to.equal('Password confirmation missing');
            done();
          });
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

      it(`should include fname in errors with message \n\t    "First name cannot be greater than ${vConstants.signup.fname.max} characters" \n\t    if it is greater than ${vConstants.signup.fname.max} characters long`, function(done) {
        data.fname = 'veryclearlygreaterthantwentycharacterslong';
        request(app).post('/signupTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors.fname).to.exist;
            expect(res.body.errors.fname.msg).to.equal(`First name cannot be greater than ${vConstants.signup.fname.max} characters`);
            done();
          });
      });
      it(`should include username in errors with message \n\t    "Username must be between ${vConstants.signup.username.min} and ${vConstants.signup.username.max} characters long" \n\t    if its less than 5 chars long`, function(done) {
        data.username = 'four';
        request(app).post('/signupTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors.username).to.exist;
            expect(res.body.errors.username.msg).to.equal(`Username must be between ${vConstants.signup.username.min} and ${vConstants.signup.username.max} characters long`);
            done();
          });
      });
      it(`should include username in errors with message \n\t    "Username must be between ${vConstants.signup.username.min} and ${vConstants.signup.username.max} characters long" \n\t    if its greater than 12 characters long`, function(done) {
        data.username = 'thirteenthirt';
        request(app).post('/signupTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors.username).to.exist;
            expect(res.body.errors.username.msg).to.equal(`Username must be between ${vConstants.signup.username.min} and ${vConstants.signup.username.max} characters long`);
            done();
          });
      });
      it(`should include email in errors with message \n\t    "Invalid email" \n\t     if its greater than 64 characters long`, function(done) {
        data.email = 'dkjsgkdfhgkdfkjxhkjdfghjfkjhfgkljbkjfnbkfjgjdfghkjgfklhfccccccccc@email.com';
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
      it(`should include password in errors with message \n\t    "Password must be between ${vConstants.signup.password.min} and  ${vConstants.signup.password.max} characters long" \n\t     if its not between ${vConstants.signup.password.min} <= chars <=  ${vConstants.signup.password.max}`, function(done) {
        // test1
        data.password = 'seven77';
        request(app).post('/signupTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors.password).to.exist;
            expect(res.body.errors.password.msg).to.equal(`Password must be between ${vConstants.signup.password.min} and ${vConstants.signup.password.max} characters long`);

            // test2
            data.password = 'djfghkldhgdjfghkldhgdjfghkldhgdjfghkldhgdjfghkldhgdjfghkldhgdjfghkldhgdjfghkldhgdjfghkldhgdjfghkldhgs';
            request(app).post('/signupTest')
              .send(data)
              .end(function(err, res) {
                if(err)
                  return done(err);
                expect(res.body.errors.password).to.exist;
                expect(res.body.errors.password.msg).to.equal(`Password must be between ${vConstants.signup.password.min} and ${vConstants.signup.password.max} characters long`);
                done();
              });
          });
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
        data.password = 'something once';
        data.passwordConfirmation = 'somethingTwice';
        request(app).post('/signupTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors.passwordConfirmation).to.exist;
            expect(res.body.errors.passwordConfirmation.msg).to.equal('Password confirmation does not match password');
            done();
          });
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
