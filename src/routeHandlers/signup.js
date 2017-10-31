const { matchedData } = require('express-validator/filter');
const { validationResult } = require('express-validator/check');
const { SESSION_COOKIE_NAME } = require('../config');

// POST /signup
const postSignup = function(req, res, errors, validData, userController) {
  if(req.cookies[SESSION_COOKIE_NAME])
    return res.redirect('/dashboard');
  if(!errors.isEmpty())
    return res.redirect('/signup');
  userController.ensureEmailAndUsernameUnique(validData.email, validData.username)
    .then(users => res.send(users));
};

module.exports = {
  postSignup
};
