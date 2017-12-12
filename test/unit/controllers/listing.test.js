const chai = require('chai');
const expect = chai.expect;
const cAssert = chai.assert;
const sinon = require('sinon');
const _ = require('lodash');

describe('#ListingController', function() {
	const listingController = require('../../../src/controllers/listing');

	it('should not have a this.model until its manually set by calling setModel on it', function() {
		expect(listingController.model).to.be.undefined;
		const fakeModel = function() {};
		listingController.setModel(fakeModel);
		expect(listingController.model).to.equal(fakeModel);
		delete listingController.model;
	});

	afterEach(function() {
		delete listingController.model;
	});

	describe('#createListing', function() {
		let validData;
		beforeEach(function() {
			validData = { title: 'a', description: 'd', lang: 'PYTHON', type: 'FULL_TIME' };
		});
		it('should return a promise', function() {
			let promise = listingController.createListing(validData);
			promise.catch(() => {});
			expect(promise.then).to.exist;
			expect(promise.catch).to.exist;
		});
		it('[implementation] should call the model as a constructor with validData', function(done) {
			const stubModel = sinon.stub().returns(validData);
			listingController.setModel(stubModel);
			listingController.createListing(validData)
			.then(listing => {
				cAssert(stubModel.calledOnce, 'model was not called once');
				cAssert(stubModel.calledWithNew(), 'model was not called as a constructor');
				cAssert(stubModel.calledWith(validData), 'Did not call model constructor with validData');
			})
			.catch(err => {
				cAssert(stubModel.calledOnce, 'model was not called once');
				cAssert(stubModel.calledWithNew(), 'model was not called as a constructor');
				cAssert(stubModel.calledWith(validData), 'Did not call model constructor with validData');
			})
			.then(done, done);
		});
		it('[implementation] should call save() on the model object', function(done) {
			let modelInstance = _.cloneDeep(validData);
			const saveRetVal = _.cloneDeep(validData);
			modelInstance.save = function() {
				return Promise.resolve(saveRetVal);
			};
			let saveSpy = sinon.spy(modelInstance, 'save');
			fakeModel = function(data) { return modelInstance };
			listingController.setModel(fakeModel);
			listingController.createListing(validData)
			.then(listing => cAssert(saveSpy.calledOnce, 'did not call save() on model instance'))
			.catch(err => { throw err; })
			.then(done, done);
		});
		it('should reject if save() throws error', function() {
			let modelInstance = _.cloneDeep(validData);
			const saveErrorMessage = 'Could not save to DB';
			modelInstance.save = function() { return Promise.reject(new Error(saveErrorMessage)); };
			const fakeModel = function(data) { return modelInstance };

			listingController.setModel(fakeModel);
			const promise = listingController.createListing(validData)
			return promise.should.be.rejectedWith('Could not save to DB');
		});
		it('should resolve with created listing if save() succeeds', function() {
			const modelInstance = _.cloneDeep(validData);
			const expectedResolve = _.cloneDeep(validData);
			modelInstance.save = function() {
				return Promise.resolve(expectedResolve);
			};
			const fakeModel = function(data) {
				return modelInstance;
			};
			listingController.setModel(fakeModel);
			const promise = listingController.createListing(validData);
			return promise.should.eventually.deep.equal(expectedResolve);
		});
	});
});