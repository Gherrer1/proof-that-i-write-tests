const {SESSION_COOKIE_NAME,
	   CLIENT_ERROR_COOKIE_NAME,
	   SERVER_ERROR_COOKIE_NAME,
	   CLIENT_SUCCESS_COOKIE_NAME} = require('../config');

function getLogin(req, res) {
	if( req.isAuthenticated() ) {
		res.redirect('/dashboard');
	}
	else {
		res.render('login'); // will contain req.locals.flashMessage if request came with a flash message cookie, i'd like to make this more explicit
	}
}

module.exports = {
	getLogin
};