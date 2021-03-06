const bodyParser              = require('body-parser');
const express                 = require('express');
const chai                    = require('chai');
const expect                  = chai.expect;
const request                 = require('supertest');
const { signupValidators }    = require('../../src/validators');
const { loginValidators }     = require('../../src/validators');
const { listingValidators }   = require('../../src/validators');
const { validationResult }    = require('express-validator/check');
const { matchedData }         = require('express-validator/filter');
const vConstants              = require('../../src/validators/validatorConstants');
const debug                   = require('debug')('validator-integration-tests');

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
app.post('/loginTest', loginValidators, function(req, res) {
  const errors = validationResult(req);
  const validData = matchedData(req);
  const sentData = req.body;

  const json = { validData, sentData };
  if(!errors.isEmpty()) {
    json.errors = errors.mapped();
  }

  res.json(json);
});
app.post('/listingsTest', listingValidators, function(req, res) {
  const errors = validationResult(req);
  const validData = matchedData(req);
  const sentData = req.body;

  const json = { validData, sentData };
  if(!errors.isEmpty())
    json.errors = errors.mapped();

  res.json(json);
});

// Automate testing that the validators work
describe('#Signup_Validators', function() {
  let data;

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

      it('should include username in errors if it isnt strictly alphanumeric with message \n\t    "Username must begin with letter and can only contain letters numbers and underscores" \n\t    with the exception of underscores (_)', function(done) {
        var invalidUsernames = ['w space', 'a47593_be.e', 'A47593_BE.E', 'a....', 'A....', 'a..55', 'A..55', 'a1.2.3.4.5', 'A1.2.3.4.5', 'W SPACE', 'symbols!', 'SYMBOLS!', 'symbols1#', 'SYMBOLS1#', 'symbols$', 'SYMBOLS$', '5ymbols', '5YMBOLS', '_aberrr', '_ABERRR', 'a_berr?', 'A_BERR?', '000pss', '000PSS', 'Ape head', 'APE HEAD'];
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
            expect(resObj.res.body.errors.username.msg).to.equal('Username must begin with a letter and can only contain letters, numbers, and underscores');
          });
        })
        .then(err => done(err))
        .catch(err => done(err));
      });

      it('should consider a username with only alphanumeric and underscores as valid and pass it onto validData', function(done) {
        var validUsernames = ['a2345', 'A2345', 'a____', 'A____', 'a__55', 'A__55', 'a1_2_3_4_5', 'A1_2_3_4_5'];
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
            expect(resObj.res.body.errors).to.be.undefined;
            expect(resObj.res.body.validData.username).to.exist;
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

describe('#Login_Validators', function() {
  let data;

  beforeEach(function() {
    data = {
      email: 'email@email.com',
      password: '1111111111'
    };
  });

  describe('#Validation', function() {
    describe('#Required_fields', function() {
      it('should contain email or password in errors if ANY of those fields are missing', function(done) {
        request(app).post('/loginTest')
        // dont send any data
          .end(function(err, res) {
            if(err)
              return done(err);
            // nothing should be valid btw
            expect(res.body.validData).to.deep.equal({});
            expect(res.body.errors.email).to.exist;
            expect(res.body.errors.email.msg).to.equal('Email missing');
            expect(res.body.errors.password, 'Expected password in errors, but it wasnt').to.exist;
            expect(res.body.errors.password.msg).to.equal('Password missing');
            done();
          });
      });
      it('should contain email or password in errors if ANY of those fields are 0 characters long', function(done) {
        data = { email: '', password: '' };
        request(app).post('/loginTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors, 'We expected errors but got NONE').to.exist;
            expect(res.body.errors.email).to.exist;
            expect(res.body.errors.password, 'Expected password to be in errors but it wasnt').to.exist;
            done();
          });
      });
      it('should contain email or password in errors if ANY of those fields are just spaces but meet min required chars', function(done) {
        data.email = '   '; // will fail bc its an email
        data.password = '              ';
        request(app).post('/loginTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors, 'Expected errors but we got none').to.exist;
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
      /* express-validator's isEmail() validator makes the cutoff around 70 chars. I've set mine to 75 in case express-validator stops handling this for me in the future
          If this ever breaks, adjust the test to make sure its below vConstants.user.email.max */
      it(`should include email in errors with message \n\t    "Invalid email" \n\t     if its greater than 64 characters long`, function(done) {
        data.email = 'dkjsgkdfhgkdfkjxhkjdfghjfkjhfgkljbkjfnbkfjgjdfghkjgfklhfccccccccc@email.com';
        request(app).post('/loginTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors, 'Expected Errors but got NONE').to.exist;
            expect(res.body.errors.email).to.exist;
            expect(res.body.errors.email.msg).to.equal('Invalid email');
            done();
          });
      });
      it(`should include password in errors with message \n\t    "Password must be between 8 and 100 characters long" \n\t     if its not between 8 <= chars <=  100`, function(done) {
        // test1
        data.password = 'seven77'; // 7
        request(app).post('/loginTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors, 'Expected errors to exist but got NONE').to.exist;
            expect(res.body.errors.password).to.exist;
            expect(res.body.errors.password.msg).to.equal(`Password must be between 8 and 100 characters long`);

            // test2
            data.password = 'djfghkldhgdjfghkldhgdjfghkldhgdjfghkldhgdjfghkldhgdjfghkldhgdjfghkldhgdjfghkldhgdjfghkldhgdjfghkldhgs'; // 101
            request(app).post('/loginTest')
              .send(data)
              .end(function(err, res) {
                if(err)
                  return done(err);
                expect(res.body.errors, 'Expected errors but got NONE').to.exist;
                expect(res.body.errors.password).to.exist;
                expect(res.body.errors.password.msg).to.equal(`Password must be between ${vConstants.user.password.signup.min} and ${vConstants.user.password.signup.max} characters long`);
                done();
              });
          });
      });
    });

    describe('#Misc', function() {
      it('should include email in errors with message "Invalid email" if it isnt an email', function(done) {
        data.email = 'jerry';
        request(app).post('/loginTest')
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

  describe('#Sanitization', function() {
    it('should lowercase email ONLY', function(done) {
      data = { email: 'EMAIL@EMAIL.COM', password: '   MYPASSWORD   ' };
      const expectedValidData = { email: 'email@email.com', password: data.password };

      request(app).post('/loginTest')
        .send(data)
        .end(function(err, res) {
          if(err)
            return done(err);
          expect(res.body.validData.email).to.equal(expectedValidData.email);
          done();
        });
    });

    it('email (automatically) should be trimmed. Password should not', function(done) {
      data = { email: '   email@email.com   ', password: '   mypassword   ' };
      const expectedValidData = { email: 'email@email.com', password: data.password }
      request(app).post('/loginTest')
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
});

describe('#Listing_Validators', function() {
  let data;
  beforeEach(function() {
    data = {
      title: 'y',
      description: 'o',
      type: 'FULL_TIME',
      lang: 'PYTHON'
    };
  });
  describe('#Valdiation', function() {
    describe('#Required_fields', function() {
      it('should contain title, desc, type, or subject in errors if ANY of those fields are missing', function(done) {
        data = {};
        request(app).post('/listingsTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors.title, 'title not in errors though it should be').to.exist;
            expect(res.body.errors.title.msg).to.equal('Title missing');
            expect(res.body.errors.description, 'description not in errors though it should be').to.exist;
            expect(res.body.errors.description.msg).to.equal('Description missing');
            expect(res.body.errors.type, 'type not in errors though it should be').to.exist;
            expect(res.body.errors.type.msg).to.equal('Invalid type');
            expect(res.body.errors.lang, 'lang not in errors though it should be').to.exist;
            expect(res.body.errors.lang.msg).to.equal('Invalid language');
            done();
          });
      });
      it('should contain title or desc if either of those fields are 0 chars long', function(done) {
        data = { title: '', description: '', type: '', lang: '' };
        request(app).post('/listingsTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err)
            expect(res.body.errors.title, 'title not in errors though it should be').to.exist;
            expect(res.body.errors.title.msg).to.equal('Title missing');
            expect(res.body.errors.description, 'description not in errors though it should be').to.exist;
            expect(res.body.errors.description.msg).to.equal('Description missing');
            expect(res.body.errors.type, 'type not in errors though it should be').to.exist;
            expect(res.body.errors.type.msg).to.equal('Invalid type');
            expect(res.body.errors.lang, 'lang not in errors though it should be').to.exist;
            expect(res.body.errors.lang.msg).to.equal('Invalid language');
            done();
          });
      });
      it('should contain title or desc in errors if either of those fields is just whitespace', function(done) {
        data = { title: ' ', description: ' ', type: ' ', lang: ' ' };
        request(app).post('/listingsTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err)
            expect(res.body.errors.title, 'title not in errors though it should be').to.exist;
            expect(res.body.errors.title.msg).to.equal('Title missing');
            expect(res.body.errors.description, 'description not in errors though it should be').to.exist;
            expect(res.body.errors.description.msg).to.equal('Description missing');
            expect(res.body.errors.type, 'type not in errors though it should be').to.exist;
            expect(res.body.errors.type.msg).to.equal('Invalid type');
            expect(res.body.errors.lang, 'lang not in errors though it should be').to.exist;
            expect(res.body.errors.lang.msg).to.equal('Invalid language');
            done();
          });
      });
    });

    describe('#Length_Mins/Maxs', function() {
      it('should contain errors if title is more than 75 chars long', function(done) {
        data.title = 'glfkdjgsjgjsdfjhdsfjlkhdsfhfdghjsdfl;khjdsflk;jghfsdlkjhklsdfjhlkfdsjhllfldk'; // 76
        request(app).post('/listingsTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors.title, 'Title not in errors though it should be').to.exist;
            expect(res.body.errors.title.msg).to.equal('Title cannot be greater than 75 characters long');
            done();
          });
      });
      it('should not contain errors if title is 75 or less chars long', function(done) {
        data.title = 'glfkdjgsjgjsdfjhdsfjlkhdsfhfdghjsdfl;khjdsflk;jghfsdlkjhksdfjhlkfdsjhllfldk'; // 75
        request(app).post('/listingsTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors).to.be.undefined;
            done();
          });
      });
      it('should contain errors if description is more than 500 chars long', function(done) {
        data.description = 'you wanna know what 500 chars long looks like? well take a look right here bitch. RIGHT FUCKING HERE. THIS IS WHAT THE FUCK 500 chars looks like!!!! Damn, its not even that long lol. How am I possibly gonna be able to store enough info for ninjas to glean what exactly I want donsklgjlfjg become aware of the fact that im panicking FUCKKKK. Ill do whatever you want me to do, adrianna said. i choked her and told her shes mine. then i demanded she repeat it. she said, somewhat breathlessly, im yours.you wanna know what 500 chars long looks like? well take a look right here bitch. RIGHT FUCKING HERE. THIS IS WHAT THE FUCK 500 chars looks like!!!! Damn, its not even that long lol. How am I possibly gonna be able to store enough info for ninjas to glean what exactly I want donsklgjlfjg become aware of the fact that im panicking FUCKKKK. Ill do whatever you want me to do, adrianna said. i choked her and told her shes mine. then i demanded she repeat it. she said, somewhat breathlessly, im yours'; // 1001
        expect(data.description.length).to.equal(1001);
        request(app).post('/listingsTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors.description).to.exist;
            expect(res.body.errors.description.msg).to.equal('Description cannot be greater than 1000 characters long');
            done();
          });
      });
      it('should not contain errors if description is 500 or less chars long', function(done) {
        data.description = 'you wanna know what 500 chars long looks like? well take a look right here bitch. RIGHT FUCKING HERE. THIS IS WHAT THE FUCK 500 chars looks like!!!! Damn, its not even that long lol. How am I possibly gonna b able to store enough info for ninjas to glean what exactly I want donsklgjlfjg become aware of the fact that im panicking FUCKKKK. Ill do whatever you want me to do, adrianna said. i choked her and told her shes mine. then i demanded she repeat it. she said, somewhat breathlessly, im yours.you wanna know what 500 chars long looks like? well take a look right here bitch. RIGHT FUCKING HERE. THIS IS WHAT THE FUCK 500 chars looks like!!!! Damn, its not even that long lol. How am I possibly gonna b able to store enough info for ninjas to glean what exactly I want donsklgjlfjg become aware of the fact that im panicking FUCKKKK. Ill do whatever you want me to do, adrianna said. i choked her and told her shes mine. then i demanded she repeat it. she said, somewhat breathlessly, im yours.'; // 1000
        expect(data.description.length).to.equal(1000);
        request(app).post('/listingsTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors).to.be.undefined;
            done();
          });
      });
    });

    describe('#Valid Enums', function() {
      it('should contain error if type is not a valid type enum', function(done) {
        data.type = 'FULL TIME';
        request(app).post('/listingsTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors.type).to.exist;
            expect(res.body.errors.type.msg).to.equal('Invalid type');
            done();
          });
      });
      it('should not contain error if type is a valid type enum', function(done) {
        data.type = 'FULL_TIME';
        request(app).post('/listingsTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors).to.be.undefined;
            done();
          });
      });
      it('should contain an error if lang is not a valid lang enum', function(done) {
        data.lang = 'java';
        request(app).post('/listingsTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors.lang).to.exist;
            expect(res.body.errors.lang.msg).to.equal('Invalid language');
            done();
          });
      });
      it('should not contain an error if lang is a valid lang enum', function(done) {
        data.lang = 'PYTHON';
        request(app).post('/listingsTest')
          .send(data)
          .end(function(err, res) {
            if(err)
              return done(err);
            expect(res.body.errors).to.be.undefined;
            done();
          });
      });
    });

    it('should not contain ANY errors if all fields are present and valid', function(done) {
      request(app).post('/listingsTest')
        .send(data)
        .end(function(err, res) {
          if(err)
            return done(err);
          expect(res.body.errors).to.be.undefined;
          done();
        });
    });
  });
  describe('#Sanitization', function() {
    describe('#Escaping', function() {
      it('should escape title and description', function(done) {
        done(new Error('red-green refactor'));
      });
    });
  });
});
