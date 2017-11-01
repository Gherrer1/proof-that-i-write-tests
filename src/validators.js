let { check, validationResult } = require('express-validator/check');
let { matchedData } = require('express-validator/filter');

var signupValidators = [
  check('fname', /*message=*/'first name missing') // manually tested
    .exists()
    .trim(),
  check('username')
    .exists().withMessage('Username missing') // manually tested
    .isLength({ min: 7, max: 15 }).withMessage('Username not between 7 and 15 characters long')
    .trim(),
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
