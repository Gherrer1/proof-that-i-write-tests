function ensureNoValidationErrs(req, res, next, validationResult) {
	const errors = validationResult(req);
	if(!errors.isEmpty())
		return res.redirect('/listings/new');
	next();
}

function postListing(req, res, controller, validData) {
	validData.owner_id = req.user._id;
	controller.createListing(validData)
	.then(listing => {
		res.flash('post_success', 'Your listing was created!');
		res.redirect('/dashboard');
	})
	.catch(err => {
		res.flash('server_error', 'Something went wrong. Please try again');
		res.redirect('/dashboard');
	});
}

module.exports = {
	ensureNoValidationErrs,
	postListing
};
