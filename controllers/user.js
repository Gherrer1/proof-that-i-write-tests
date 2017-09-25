/* Have as little dependencies as possible here to make it testable */
const User = require('../models/User');

function createUser(req, res) {
  let { fname, username, email, password, passwordConf } = req.body;
  // validate
  // sanitize data - includes trim()ing
  // then ensure email and username are unique
  // then hash password
  // then create user w/ hashed password
  // then save user
  // then render login form
  // catch: send back to signup with errors
  res.send(req.body);
}

module.exports = {
  createUser
};
