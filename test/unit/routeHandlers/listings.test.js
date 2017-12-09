const listingRouteHandlers = require('../../../src/routeHandlers/listings');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('#Listing_Route_Handlers', function() {
	// ensureNoValidationErrs(req, res, next, validationResult)
	describe('#ensureNoValidationErrs', function() {
		let req, res, next, validationResult;
		let redirectSpy;
		beforeEach(function() {
			res = { redirect() {} };
			validationResult = function() {
				return {
					isEmpty() { return false; }
				};
			};
			redirectSpy = sinon.spy(res, 'redirect');
		});

		it('should call res.redirect("/listings/new") if we have validation errors', function() {
			listingRouteHandlers.ensureNoValidationErrs(req, res, next, validationResult);
			expect(redirectSpy.calledOnce, 'Did not call res.redirect()').to.be.true;
			expect(redirectSpy.calledWith('/listings/new'), 'Did not call res.redirect() with "/listings/new"').to.be.true;
		});
		it('should not call res.redirect() if no validation errors', function() {
			validationResult = function() {
				return {
					isEmpty() { return true; }
				};
			}
			listingRouteHandlers.ensureNoValidationErrs(req, res, next, validationResult);
			expect(redirectSpy.notCalled, 'should not have called res.redirect()').to.be.true;
		});
		it('should not call next() if there are validation errros', function() {
			throw new Error('red-green refactor');
		});
		it('should call next() if no validation errors', function() {
			throw new Error('red-green refactor');
		});
	});
});