const {SESSION_COOKIE_NAME,
	   CLIENT_ERROR_COOKIE_NAME,
	   SERVER_ERROR_COOKIE_NAME} = require('../config');

function getLogin(req, res) {
	if(req.cookies[SESSION_COOKIE_NAME])
		return res.redirect('/dashboard');
	if(req.cookies[CLIENT_ERROR_COOKIE_NAME])
		return res.render('login', { title: 'Login', errors: [req.cookies[CLIENT_ERROR_COOKIE_NAME]] });
	if(req.cookies[SERVER_ERROR_COOKIE_NAME])
		return res.render('login', { title: 'Login', errors: ['Something went wrong. Please try again'] });
	return res.render('login', { title: 'Login', errors: [] });
}

module.exports = {
	getLogin
};