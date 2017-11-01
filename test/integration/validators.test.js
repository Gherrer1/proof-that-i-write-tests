const bodyParser              = require('body-parser');
const express                 = require('express');
const chai                    = require('chai');
const expect                  = chai.expect;
const request                 = require('supertest');
const { signupValidators }    = require('../../src/validators');
const { validationResult }    = require('express-validator/check');
const { matchedData }         = require('express-validator/filter');
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

  it('fname should be trimmed', function(done) {
    request(app).post('/signupTest')
      .send({ fname: '  hehe  ' })
      .end(function(err, res) {
        if(err) {
          return done(err);
        }
        // console.log(res.body);
        expect(res.body.validData.fname).to.equal('hehe');
        done();
      });
  });
});
