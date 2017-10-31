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
    .then(users => {
      if(users.length > 0) {
        res.redirect('/signup');
        return Promise.reject();
      }
      res.send(users);
    })
    .catch(err => {
      console.log(`err: ${err} (if undefined, probably means user is using a bot)`);
      if(!err)
        return; // if promise chain ends early and we dont have an error to throw, its handled here
    });
};

module.exports = {
  postSignup
};
