const {matchedData} = require('express-validator/filter');
const {validationResult} = require('express-validator/check');
const {SALT_ROUNDS} = require('../config');
const debug = require('debug')('routeHandlers:signup');

// POST /signup
/**
 * Note: middleware handles redirecting
 */
const postSignup = function(req, res, errors, validData, userController, hasher) {
  if(!errors.isEmpty())
    return res.redirect('/signup');
  userController.ensureEmailAndUsernameUnique(validData.email, validData.username)
    .then(users => {
      if(users.length > 0) {
        res.redirect('/signup');
        return Promise.reject();
      }
      return hasher.hash(validData.password, SALT_ROUNDS);
    })
    .then(hashedPassword => {
      validData.password = hashedPassword;
      return userController.createUser(validData);
    })
    .then(user => {
      res.flash('signup_success', 'You successfully signed up!');
      res.redirect('/login');
    })
    .catch(err => {
      // if theres an error, that means we need to redirect somewhere. If no error, we've already invoked response object to handle it.
      debug(`err: ${err} (if undefined, probably means user is using a bot aka not the browser)`);
      if(!err)
        return; // if promise chain ends early and we dont have an error to throw, its handled here
      res.flash('server_error', 'Something went wrong. Please try again');
      res.redirect('/signup');
    });
};

// GET /signup
/**
 * Note: does not need to handle redirecting logged in users because middleware will do that.
 * Also: middleware handles extracting and clearing flash messages and adding them to req.locals,
 *       and req.locals is automatically passed into render, so all we literally need to do is call render().
 */
const getSignup = function(req, res) {
  return res.render('signup');
};

module.exports = {
  postSignup,
  getSignup
};
