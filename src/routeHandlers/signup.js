const { matchedData } = require('express-validator/filter');
const { validationResult } = require('express-validator/check');
const { SESSION_COOKIE_NAME } = require('../config');

// POST /signup
const postSignup = function(req, res, errors, validData) {
  if(req.cookies[SESSION_COOKIE_NAME])
    return res.redirect('/dashboard');
};

module.exports = {
  postSignup
};
