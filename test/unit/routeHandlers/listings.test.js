const listingRouteHandlers = require('../../../src/routeHandlers/listings');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('#Listing_Route_Handlers', function() {
	// ensureNoValidationErrs(req, res, next, validationResult)
	describe('#ensureNoValidationErrs', function() {
		let req, res, validationResult;
		let redirectSpy, nextSpy;
		beforeEach(function() {
			res = { redirect() {} };
			validationResult = function() {
				return {
					isEmpty() { return false; }
				};
			};
			redirectSpy = sinon.spy(res, 'redirect');
			nextSpy = sinon.spy();
		});

		it('should call res.redirect("/listings/new") if we have validation errors', function() {
			listingRouteHandlers.ensureNoValidationErrs(req, res, nextSpy, validationResult);
			expect(redirectSpy.calledOnce, 'Did not call res.redirect()').to.be.true;
			expect(redirectSpy.calledWith('/listings/new'), 'Did not call res.redirect() with "/listings/new"').to.be.true;
		});
		it('should not call res.redirect() if no validation errors', function() {
			validationResult = function() {
				return {
					isEmpty() { return true; }
				};
			};
			listingRouteHandlers.ensureNoValidationErrs(req, res, nextSpy, validationResult);
			expect(redirectSpy.notCalled, 'should not have called res.redirect()').to.be.true;
		});
		it('should not call next() if there are validation errros', function() {
			listingRouteHandlers.ensureNoValidationErrs(req, res, nextSpy, validationResult);
			expect(nextSpy.notCalled, 'Should not have called next()').to.be.true;
		});
		it('should call next() if no validation errors', function() {
			validationResult = function() {
				return {
					isEmpty() { return true; }
				};
			};
			listingRouteHandlers.ensureNoValidationErrs(req, res, nextSpy, validationResult);
			expect(nextSpy.calledOnce, 'Should have called next()').to.be.true;
		});
	});
	// createListing(req, res, validData);
	// Note: wont handle checking if user is already at max - middleware will do that
	describe('#createListing', function() {
		it('[implementation] should create a new Listing')
	});
});