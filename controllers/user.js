/* Have as little dependencies as possible here to make it testable */
const User = require('../models/User');
// const { signupValidators } = require('../validators'); // returns an array of middleware using express-validator
const { matchedData } = require('express-validator/filter');
const { validationResult } = require('express-validator/check');

function createUser(req, res) {
  // validate
  const errors = validationResult(req);
  if(!errors.isEmpty())
    return res.send({ errors: errors.mapped(), body: req.body, weHaveErrors: !errors.isEmpty() });

  const body = matchedData(req);
  res.send({ origBody: req.body, newBody: body, weHaveErrors: false });
  // res.send({ errors: errors.mapped(), body: req.body, doWeHaveErrors: !errors.isEmpty() })
  // sanitize data - includes trim()ing
  // then ensure email and username are unique
  // then hash password
  // then create user w/ hashed password
  // then save user
  // then render login form
  // catch: send back to signup with errors
  // res.send(req.body);
}

module.exports = {
  createUser
};
