let { check, validationResult } = require('express-validator/check');
let { matchedData }             = require('express-validator/filter');
let vConstants                  = require('./validatorConstants');

var signupValidators = [
  check('fname')
    .exists().withMessage('First name missing')
    .isLength({ min: 1 }),
  check('username')
    .exists().withMessage('Username missing')
    .isLength({ min: 1 }),
  check('email')
    .exists().withMessage('Email missing')
    .isEmail().withMessage('Invalid email'),
  check('password')
    .exists().withMessage('Password missing')
    .isLength({ min: 1 }),
  check('passwordConfirmation')
    .exists().withMessage('Password confirmation missing')
    .isLength({ min: 1 })
  // check('fname', /*message=*/'first name missing') // manually tested
  //   .exists()
  //   .trim(),
  // check('username')
  //   .exists().withMessage('Username missing') // manually tested
  //   .isLength({ min: 7, max: 15 }).withMessage('Username not between 7 and 15 characters long')
  //   .trim(),
  // check('email', /*message=*/'invalid email')
  //   .isEmail()
  //   .trim()
  //   .normalizeEmail(),
  // check('password')
  //   .exists().withMessage('missing password'),
  // check('passwordConfirmation', /*message=*/'password confirmation must match password')
  //   .exists().withMessage('missing password confirmation')
  //   .custom((value, { req }) => value === req.body.password)
];

module.exports = {
  signupValidators // Array of middleware functions
}
