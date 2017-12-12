function ensureNoValidationErrs(req, res, next, validationResult) {
	const errors = validationResult(req);
	if(!errors.isEmpty())
		return res.redirect('/listings/new');
	next();
}

function postListing(req, res, controller, validData) {
	controller.createListing(validData)
	.then(listing => {
		res.redirect('/dashboard');
	});
}

module.exports = {
	ensureNoValidationErrs,
	postListing
};
