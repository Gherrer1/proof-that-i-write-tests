function getLogin(req, res) {
	if( req.isAuthenticated() ) {
		res.redirect('/dashboard');
	}
	else {
		res.render('login'); // will contain req.locals.flashMessage if request came with a flash message cookie, i'd like to make this more explicit
	}
}

function ensureNoValidationErrs(req, res, next, matchedData, validationResult) {
	const errors = validationResult(req);
	if(!errors.isEmpty()) {
		res.flash('client_error', 'Invalid credentials', req.body.email);
		return res.redirect('/login');
	}
	req.body = matchedData(req);
	return next();
}

/**
 * Since we're using custom callback, it's my responsibility to establish a session by calling req.login()
 * and to send the response.
 */
function handleAuthenticationResult(req, res, err, user, info) {
	if(err) {
		res.flash('server_error', 'Something went wrong. Please try again', req.body.email);
		return res.redirect('/login');
	}
	if(!user) {
		res.flash('client_error', 'Invalid credentials', req.body.email);
		return res.redirect('/login');
	}
	req.login(user, function(err) {
		if(err) {
			res.flash('server_error', 'Something went wrong. Please try again', req.body.email);
			return res.redirect('/login');
		}
		return res.redirect('/dashboard');
	});
}

module.exports = {
	getLogin,
	ensureNoValidationErrs,
	handleAuthenticationResult
};
