function ensureNoValidationErrs(req, res, next, validationResult) {
	const errors = validationResult(req);
	if(!errors.isEmpty())
		return res.redirect('/listings/new');
	next();
}

function postListing(req, res, validData) {

}

module.exports = {
	ensureNoValidationErrs,
	postListing
};
