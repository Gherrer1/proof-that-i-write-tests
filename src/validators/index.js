let { check, validationResult } = require('express-validator/check');
let { matchedData }             = require('express-validator/filter');
let vConstants                  = require('./validatorConstants');

// the way these work: unless message is explicitly listed, default message inluded with check() is the message used
var signupValidators = [
  check('fname', 'First name missing')
    .exists()
    .isLength({ min: 1 }) // max currently 20
    .isLength({ max: vConstants.user.fname.max }).withMessage(`First name cannot be greater than ${vConstants.user.fname.max} characters`)
    .custom(value => !vConstants.user.fname.regex.test(value)).withMessage('First name cannot contain numbers or anomolous symbols')
    .trim(),
  check('username', 'Username missing')
    .exists() // min, max currently 5, 12
    .isLength({ min: vConstants.user.username.min, max: vConstants.user.username.max }).withMessage(`Username must be between ${vConstants.user.username.min} and ${vConstants.user.username.max} characters long`)
    .matches(vConstants.user.username.regex).withMessage('Username must begin with a letter and can only contain letters, numbers, and periods')
    .trim(),
  check('email', 'Email missing')
    .exists()
    .trim()
    .isLength({ min: 1 }) // has a natural max by virtue of checking for isEmail()
    .isEmail().withMessage('Invalid email')
    .normalizeEmail(),
  check('password', 'Password missing')
    .exists()
    .isLength({ min: vConstants.user.password.signup.min, max: vConstants.user.password.signup.max }).withMessage(`Password must be between ${vConstants.user.password.signup.min} and ${vConstants.user.password.signup.max} characters long`),
  check('passwordConfirmation', 'Password confirmation missing')
    .exists()
    .isLength({ min: 1 }) // not saved so we DGAF about how long
    .custom( (value, { req }) => value === req.body.password ).withMessage('Password confirmation does not match password')
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
];

module.exports = {
  signupValidators // Array of middleware functions
}
