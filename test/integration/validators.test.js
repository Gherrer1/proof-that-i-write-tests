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
describe('#Signup Validators', function() {
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

      request(app).post('/signupTest')
        .send(data)
        .end(function(err, res) {
          if(err)
            return done(err);
          // expect(res.body.validData.username).to.equal(expectedValidData.username); not necessary anymore - model handles lowercasing when we save
          expect(res.body.validData.email).to.equal(expectedValidData.email);
          done();
        });
    });

    it('fname, username, and email (automatically) should be trimmed. Password/Confirmation should not', function(done) {
      data = { fname: '   jerry   ', username: '   jerry   ', email: '   email@email.com   ', password: '   mypassword   ', passwordConfirmation: '   mypassword   ' };
      const expectedValidData = {
        fname: 'jerry', username: 'jerry', email: 'email@email.com', password: data.password, passwordConfirmation: data.passwordConfirmation
      }
      request(app).post('/signupTest')
        .send(data)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }

          expect(res.body.errors).to.be.undefined;
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
            // expect(res.body.errors.username.msg).to.equal('Username missing'); no longer applicable - will just tell you minimum
            expect(res.body.errors.email).to.exist;
            // expect(res.body.errors.email.msg).to.equal('Email missing'); no longer applicable - will tell you invalid email
            expect(res.body.errors.password).to.exist;
            // expect(res.body.errors.password.msg).to.equal('Password missing'); no longer applicable - will just tell you minimum
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

      it('should contain fname, email, password, or passwordConfirmation in errors if ANY of those fields are just spaces but meet min required chars', function(done) {
        data.fname = '  ';
        // username obviously wouldnt meet regex - for that matter neither would fname
        data.email = '   '; // will fail bc its an email
        data.password = '              ';
        data.passwordConfirmation = '              ';
        request(app).post('/signupTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors.fname).to.exist;
            expect(res.body.errors.fname.msg).to.equal('First name missing');
            expect(res.body.errors.email).to.exist;
            expect(res.body.errors.email.msg).to.equal('Invalid email');
            // TODO: implement validation to make sure password isnt too weak
            // expect(res.body.errors.password).to.exist; TODO
            // expect(res.body.errors.passwordConfirmation).to.exist; dont really need todo, password should be enough and passwordConfirmation matching should be enough
            done();
          });
      });
    });

    describe('#Length Mins/Maxs', function() {
      it(`should include fname in errors with message \n\t    "First name cannot be greater than ${vConstants.user.fname.max} characters" \n\t    if it is greater than ${vConstants.user.fname.max} characters long`, function(done) {
        data.fname = 'veryclearlygreaterthantwentycharacterslong';
        request(app).post('/signupTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors.fname).to.exist;
            expect(res.body.errors.fname.msg).to.equal(`First name cannot be greater than ${vConstants.user.fname.max} characters`);
            done();
          });
      });
      it(`should include username in errors with message \n\t    "Username must be between ${vConstants.user.username.min} and ${vConstants.user.username.max} characters long" \n\t    if its less than 5 chars long`, function(done) {
        data.username = 'four';
        request(app).post('/signupTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors.username).to.exist;
            expect(res.body.errors.username.msg).to.equal(`Username must be between ${vConstants.user.username.min} and ${vConstants.user.username.max} characters long`);
            done();
          });
      });
      it(`should include username in errors with message \n\t    "Username must be between ${vConstants.user.username.min} and ${vConstants.user.username.max} characters long" \n\t    if its greater than 12 characters long`, function(done) {
        data.username = 'thirteenthirt';
        request(app).post('/signupTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors.username).to.exist;
            expect(res.body.errors.username.msg).to.equal(`Username must be between ${vConstants.user.username.min} and ${vConstants.user.username.max} characters long`);
            done();
          });
      });
      /* express-validator's isEmail() validator makes the cutoff around 70 chars. I've set mine to 75 in case express-validator stops handling this for me in the future
          If this ever breaks, adjust the test to make sure its below vConstants.user.email.max */
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
      it(`should include password in errors with message \n\t    "Password must be between ${vConstants.user.password.signup.min} and  ${vConstants.user.password.signup.max} characters long" \n\t     if its not between ${vConstants.user.password.signup.min} <= chars <=  ${vConstants.user.password.signup.max}`, function(done) {
        // test1
        data.password = 'seven77';
        request(app).post('/signupTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors.password).to.exist;
            expect(res.body.errors.password.msg).to.equal(`Password must be between ${vConstants.user.password.signup.min} and ${vConstants.user.password.signup.max} characters long`);

            // test2
            data.password = 'djfghkldhgdjfghkldhgdjfghkldhgdjfghkldhgdjfghkldhgdjfghkldhgdjfghkldhgdjfghkldhgdjfghkldhgdjfghkldhgs';
            request(app).post('/signupTest')
              .send(data)
              .end(function(err, res) {
                if(err)
                  return done(err);
                expect(res.body.errors.password).to.exist;
                expect(res.body.errors.password.msg).to.equal(`Password must be between ${vConstants.user.password.signup.min} and ${vConstants.user.password.signup.max} characters long`);
                done();
              });
          });
      });
    });

    describe('#Regex', function() {
      it('should include fname in errors with message \n\t    "Name cannot contain numbers or anomolous symbols" \n\t    if it contains a number or any of these characters: !@#$%^&*?/\\[]{}()<>+=;:', function(done) {
        // lets get fancy
        var invalidNames = ['jerry1', 'Verylegit1Name', 'jerry!', 'j@rry', '?erry', 'j{}rry', 'j+rry', 'je#y', 'je:;y']
        var promises = invalidNames.map(faultyName => {
          return { fname: faultyName, email: data.email, username: data.username, password: data.password, passwordConfirmation: data.passwordConfirmation }
        })
        .map(data => new Promise(function(resolve, reject) {
          request(app).post('/signupTest')
            .send(data)
            .end(function(err, res) {
              resolve({ err, res });
            });
        }));
        Promise.all(promises)
          .then(results => {
            results.forEach(resObj => {
                expect(resObj.res.body.errors.fname).to.exist;
                expect(resObj.res.body.errors.fname.msg).to.equal('First name cannot contain numbers or anomolous symbols');
            });
          })
          .then((err) => {
            done(err);
          })
          .catch(err => {
            done(err);
          });
      });

      it('should consider a name with spaces but without numbers of anomolous symbols valid and pass it onto validData', function(done) {
        var validNames = ['jerry withspaces', 'jerry with\'neil', 'j. erry', 'look ma two  spaces', 'kareem-abdul jabbar'];
        var promises = validNames.map(name => {
          return { fname: name, email: data.email, username: data.username, password: data.password, passwordConfirmation: data.passwordConfirmation };
        })
        .map(data => new Promise(function(resolve, reject) {
          request(app).post('/signupTest')
            .send(data)
            .end(function(err, res) {
              resolve({ err, res });
            });
        }));
        Promise.all(promises).then(results => {
          results.forEach(resObj => {
            expect(resObj.res.body.errors).to.be.undefined;
            expect(resObj.res.body.validData.fname).to.exist;
          });
        })
        .then(err => done(err))
        .catch(err => done(err));
      });

      it('should include username in errors if it isnt strictly alphanumeric with message \n\t    "Username must begin with letter and can only contain letters numbers and periods" \n\t    with the exception of periods (.)', function(done) {
        var invalidUsernames = ['w space', 'W SPACE', 'symbols!', 'SYMBOLS!', 'symbols1#', 'SYMBOLS1#', 'symbols$', 'SYMBOLS$', '5ymbols', '5YMBOLS', '.aberrr', '.ABERRR', 'a.berr?', 'A.BERR?', '000pss', '000PSS', 'Ape head', 'APE HEAD'];
        var promises = invalidUsernames.map(invalidUsername => {
          return { fname: data.fname, username: invalidUsername, email: data.email, password: data.password, passwordConfirmation: data.passwordConfirmation };
        })
        .map(data => new Promise(function(resolve, reject) {
          request(app).post('/signupTest')
            .send(data)
            .end(function(err, res) {
              resolve({ err, res });
            });
        }));
        Promise.all(promises)
        .then(results => {
          results.forEach(resObj => {
            expect(resObj.res.body.errors.username).to.exist;
            expect(resObj.res.body.errors.username.msg).to.equal('Username must begin with a letter and can only contain letters, numbers, and periods');
          });
        })
        .then(err => done(err))
        .catch(err => done(err));
      });

      it('should consider a username with only alphanumeric and periods as valid and pass it onto validData', function(done) {
        var validUsernames = ['a2345', 'A2345', 'a....', 'A....', 'a..55', 'A..55', 'a1.2.3.4.5', 'A1.2.3.4.5'];
        var promises = validUsernames.map(validUsername => {
          return { fname: data.fname, username: validUsername, email: data.email, password: data.password, passwordConfirmation: data.passwordConfirmation };
        })
        .map(data => new Promise(function(resolve, reject) {
          request(app).post('/signupTest')
            .send(data)
            .end(function(err, res) {
              resolve({ err, res });
            });
        }));
        Promise.all(promises)
        .then(results => {
          results.forEach(resObj => {
            // expect(resObj.res.body.errors.usernaem).to.exist;
            expect(resObj.res.body.errors).to.be.undefined;
            // expect(resObj.res.body.validData).to.exist;
            expect(resObj.res.body.validData.username).to.exist;
            // expect(resObj.res.body.validData.username).to.be.undefined;
          });
        })
        .then(err => done(err))
        .catch(err => done(err));
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
