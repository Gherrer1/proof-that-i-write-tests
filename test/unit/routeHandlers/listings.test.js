const listingRouteHandlers = require('../../../src/routeHandlers/listings');
const sinon = require('sinon');
const expect = require('chai').expect;
const assert = require('chai').assert;

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
	// ensureLTE10ActiveListings(req, res, next, controller, user_id)
	describe('#ensureLTE10ActiveListings', function() {
		let req, res, next, controller, user_id;
		let flashSpy, redirectSpy;
		beforeEach(function() {
			req = {};
			res = { flash() {}, redirect() {} };
			next = function() {};
			controller = { countBelongsTo() { return Promise.resolve(5); } };
			user_id = 'abc123';
			flashSpy = sinon.spy(res, 'flash');
			redirectSpy = sinon.spy(res, 'redirect');
		});
		it('[implementation] should call controller.countBelongsTo() with user_id', function() {
			const countBelongsToStub = sinon.spy(controller, 'countBelongsTo');
			listingRouteHandlers.ensureLTE10ActiveListings(req, res, next, controller, user_id);
			assert(countBelongsToStub.calledOnce, 'Didnt call countBelongsTo()');
			assert(countBelongsToStub.calledWith(user_id), 'Didnt call countBelongsTo() with user_id');
		});
		it('[implementation] should call res.flash("over_limit") if countBelongsTo() resolves with 10+', function(done) {
			const countBelongsToStub = sinon.stub(controller, 'countBelongsTo').resolves(10);
			listingRouteHandlers.ensureLTE10ActiveListings(req, res, next, controller, user_id);
			setTimeout(function() {
				assert(flashSpy.calledOnce, 'Didnt call res.flash()');
				assert(flashSpy.calledWith('over_limit'), 'Didnt call res.flash() with "over_limit"');
				done();
			}, 0)
		});
		it('[implementation] should call res.redirect("/dashboard") if countBelongsTo() resolves with 10+', function(done) {
			const countBelongsToStub = sinon.stub(controller, 'countBelongsTo').resolves(10);
			listingRouteHandlers.ensureLTE10ActiveListings(req, res, next, controller, user_id);
			setTimeout(function() {
				assert(redirectSpy.calledOnce, 'Didnt call res.redirect()');
				assert(redirectSpy.calledWith('/dashboard'), 'Didnt call res.redirect() with "/dashboard"');
				done();
			}, 0)
		});
		it('[implementation] should call res.flash("server_error") if countBelongsTo() rejects', function(done) {
			const countBelongsToStub = sinon.stub(controller, 'countBelongsTo').rejects(new Error('DB Problemz'));
			listingRouteHandlers.ensureLTE10ActiveListings(req, res, next, controller, user_id);
			setTimeout(function() {
				assert(flashSpy.calledOnce, 'Did not call res.flash()');
				assert(flashSpy.calledWith('server_error'), 'Did not call res.flash() with "server_error"');
				done();
			}, 0);
		});
		it('[implementation] should call res.redirect("/dashboard") if countBelongsTo() rejects', function(done) {
			const countBelongsToStub = sinon.stub(controller, 'countBelongsTo').rejects(new Error('DB Problemz'));
			listingRouteHandlers.ensureLTE10ActiveListings(req, res, next, controller, user_id);
			setTimeout(function() {
				assert(redirectSpy.calledOnce, 'Did not call res.redirect()');
				assert(redirectSpy.calledWith('/dashboard'), 'Did not call res.redirect() with "/dashboard"');
				done();
			}, 0);
		});
		it('should call next() if countBelongsTo() resolves to <= 9', function(done) {
			const countBelongsToStub = sinon.stub(controller, 'countBelongsTo').resolves(9);
			const nextSpy = sinon.spy();
			listingRouteHandlers.ensureLTE10ActiveListings(req, res, nextSpy, controller, user_id);
			setTimeout(function() {
				assert(nextSpy.calledOnce, 'Didnt call next()');
				done();
			}, 0)
		});
	});
	// createListing(req, res, validData);
	// Note: wont handle checking if user is already at max - middleware will do that
	describe('#createListing', function() {
		it('[implementation] should create a new Listing')
	});
	// getById(req, res, controller)
	describe('#getById', function() {
		it('[implementation] should call controller.findByIdAndOwnerId() with { req.params.id, req.user._id }', function() {
			throw new Error('red-green refactor');
		});
		it('should call res.render("404") if no listing found', function() {
			throw new Error('red-green refactor');
		});
		it('should call res.render("listing") if listing found', function() {
			throw new Error('red-green refactor');
		});
		it('should call res.redirect("/dashboard") with server_error flash if search rejects', function() {
			throw new Error('red-green refactor');
		});
	});
});