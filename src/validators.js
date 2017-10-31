let { check, validationResult } = require('express-validator/check');
let { matchedData } = require('express-validator/filter');

var signupValidators = [
  check('email', /*message=*/'invalid email')
    .isEmail()
    .trim()
    .normalizeEmail(),
  check('password')
    .exists().withMessage('missing password'),
  check('passwordConfirmation', /*message=*/'password confirmation must match password')
    .exists().withMessage('missing password confirmation')
    .custom((value, { req }) => value === req.body.password)
];

module.exports = {
  signupValidators // Array of middleware functions
}
