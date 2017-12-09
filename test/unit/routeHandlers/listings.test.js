const listingRouteHandlers = require('../../../src/routeHandlers/listings');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('#Listing_Route_Handlers', function() {
	// ensureNoValidationErrs(req, res, next, matchedData, validationResult)
	describe('#ensureNoValidationErrs', function() {
		let req, res, next, matchedData, validationResult;
		// let //spies;
		beforeEach(function() {

		});

		it('should call res.redirect("/listings/new") if we have validation errors', function() {
			throw new Error('red-green refactor');
		});
		it('should not call res.redirect() if no validation errors', function() {
			throw new Error('red-green refactor');
		});
		it('should not call next() if there are validation errros', function() {
			throw new Error('red-green refactor');
		});
		it('should call next() if no validation errors', function() {
			throw new Error('red-green refactor');
		});
	});
});