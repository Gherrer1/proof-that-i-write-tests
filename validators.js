let { check, validationResult } = require('express-validator/check');
let { matchedData } = require('express-validator/filter');

var signupValidators = [
  check('email', /*message=*/'invalid email')
    .isEmail()
    .trim()
    .normalizeEmail()
]

module.exports = {
  signupValidators // Array of middleware functions
}
