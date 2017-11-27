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

module.exports = {
	getLogin,
	ensureNoValidationErrs
};
