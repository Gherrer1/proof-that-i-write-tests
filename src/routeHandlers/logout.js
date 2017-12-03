const {SESSION_COOKIE_NAME} = require('../config');

function logout(req, res) {
	req.logout();
	req.session.destroy(function(err) {
		res.clearCookie(SESSION_COOKIE_NAME);
		return res.redirect('/login');		
	});
}

module.exports = {
	logout
};