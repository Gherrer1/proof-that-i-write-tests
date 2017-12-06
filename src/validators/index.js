let { check } = require('express-validator/check'); // TODO: remove these validationResult and matchedData
let vConstants                  = require('./validatorConstants');

// the way these work: unless message is explicitly listed, default message inluded with check() is the message used
var signupValidators = [
  check('fname', 'First name missing')
    .exists()
    .isLength({ min: 1 }) // max currently 20
    .isLength({ max: vConstants.user.fname.max }).withMessage(`First name cannot be greater than ${vConstants.user.fname.max} characters`)
    .matches(vConstants.user.fname.regex).withMessage('First name cannot contain numbers or anomolous symbols')
    .trim(),
  check('username', 'Username missing')
    .exists() // min, max currently 5, 12
    .isLength({ min: vConstants.user.username.min, max: vConstants.user.username.max }).withMessage(`Username must be between ${vConstants.user.username.min} and ${vConstants.user.username.max} characters long`)
    .matches(vConstants.user.username.regex).withMessage('Username must begin with a letter and can only contain letters, numbers, and underscores')
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
];

const loginValidators = [
  check('email', 'Email missing')
    .exists()
    .trim()
    .isLength({ min: 1 })
    .isEmail().withMessage('Invalid email')
    .normalizeEmail(),
  check('password', 'Password missing')
    .exists()
    .isLength({ min: vConstants.user.password.signup.min, max: vConstants.user.password.signup.max }).withMessage(`Password must be between ${vConstants.user.password.signup.min} and ${vConstants.user.password.signup.max} characters long`)
];

module.exports = {
  signupValidators, // Array of middleware functions
  loginValidators,
  listingValidators: require('./listing')
}
