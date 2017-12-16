const chai = require('chai');
const expect = chai.expect;
const cAssert = chai.assert;
const sinon = require('sinon');
const _ = require('lodash');

describe.only('#ListingController', function() {
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

	describe('#countBelongsTo', function() {
		it('should return a promise', function() {
			const promise = listingController.countBelongsTo();
			promise.catch(() => {});
			cAssert.exists(promise.then);
			cAssert.exists(promise.catch);
		});
		it('[implementation] should call model.count() with id of owner', function() {
			const owner_id = '5a301861624b4b1fc92e8324';
			const fakeModel = {
				count() {}
			};
			const countSpy = sinon.spy(fakeModel, 'count');
			listingController.setModel(fakeModel);
			listingController.countBelongsTo(owner_id).catch(() => {});
			cAssert(countSpy.calledOnce, 'model.count() not called');
			cAssert.deepEqual(countSpy.args[0][0], { owner_id }, 'did not call model.count() with { owner_id }');
		});
		it('should reject if model rejects', function() {
			const fakeModel = {
				count() { return Promise.reject(new Error('Something went wong')); }
			};
			listingController.setModel(fakeModel);
			const owner_id = '5a301861624b4b1fc92e8324';
			const promise = listingController.countBelongsTo(owner_id);
			return promise.should.be.rejectedWith('Something went wong');
		});
		it('should resolve with number if model resolves', function() {
			const owner_id = '5a301861624b4b1fc92e8324';
			const fakeModel = {
				count() { return Promise.resolve(2); }
			};
			listingController.setModel(fakeModel);
			const promise = listingController.countBelongsTo(owner_id);
			return promise.should.eventually.equal(2);
		});
	});

	describe('#findBelongsTo', function() {
		let owner_id = 'abc123';

		it('should return a promise', function() {
			let promise = listingController.findBelongsTo();
			promise.catch(() => {});
			cAssert.exists(promise.then);
			cAssert.exists(promise.catch);
		});
		it('[implementation] should call model.find() with user_id', function() {
			const fakeModel = { find() {} };
			const findSpy = sinon.spy(fakeModel, 'find');
			listingController.setModel(fakeModel);
			listingController.findBelongsTo(owner_id).catch(() => {});
			cAssert(findSpy.calledOnce, 'model.find() not called');
			cAssert.deepEqual(findSpy.args[0][0], { owner_id }, 'model.find() not called with { user_id }');
		});
		it('should reject if model rejects', function() {
			const fakeModel = { find() { return Promise.reject(new Error('Problemz')); } };
			listingController.setModel(fakeModel);
			let promise = listingController.findBelongsTo(owner_id);
			return promise.should.be.rejectedWith('Problemz');
		});
		it('should resolve with array if model resolves', function() {
			const fakeModel = { find() { return Promise.resolve([{ title: 'Success baby' }]); } };
			listingController.setModel(fakeModel);
			let promise = listingController.findBelongsTo(owner_id);
			return promise.should.eventually.deep.equal([ { title: 'Success baby' } ]);
		});
	});

	describe('#findByIdAndOwnerId', function() {
		it('should return a promise', function() {
			const promise = listingController.findByIdAndOwnerId();
			promise.catch(() => {});
			cAssert.exists(promise.then);
			cAssert.exists(promise.catch);
		});
		it('[implementation] should call model.findOne({ id, owner_id })', function() {
			const listing_id = '123';
			const owner_id = 'abc';
			const fakeModel = { findOne() { return Promise.resolve(null); } };
			const findSpy = sinon.spy(fakeModel, 'findOne');
			listingController.setModel(fakeModel);
			listingController.findByIdAndOwnerId(listing_id, owner_id);
			cAssert(findSpy.calledOnce, 'findOne() not called');
			// cAssert(findSpy.calledWith('123'), 'find() not called with user_id');
			cAssert.deepEqual(findSpy.args[0][0], { _id: listing_id, owner_id }, 'findOne() not called with { listing_id, owner_id }');
		});
		it('should reject if model rejects', function() {
			const id = '123';
			const fakeModel = { findOne() { return Promise.reject(new Error('probz')); } };
			listingController.setModel(fakeModel);
			let promise = listingController.findByIdAndOwnerId(id);
			return promise.should.be.rejectedWith('probz');
		});
		it('should resolve with listing object if model resolves', function() {
			const expectedResolveVal = { title: 'a', description: 'b' };
			const resolveVal = _.cloneDeep(expectedResolveVal);
			const fakeModel = { findOne() { return Promise.resolve(resolveVal) } };
			listingController.setModel(fakeModel);
			let promise = listingController.findByIdAndOwnerId();
			return promise.should.eventually.deep.equal(expectedResolveVal);
		});
	});

	describe('#deleteByIdAndOwnerId', function() {
		let fakeModel, listingID, owner_id;
		beforeEach(function() {
			listingID = '123';
			owner_id = 'abc';
			fakeModel = { deleteOne() { return Promise.reject('If you having DB prolemz i feel bad 4 u son'); } };
		});
		it('should return a promise', function() {
			listingController.setModel(fakeModel);
			const promise = listingController.deleteByIdAndOwnerId();
			promise.catch(() => {});
			cAssert.exists(promise.catch);
			cAssert.exists(promise.then);
		});
		it('[implementation] should call model.deleteOne({ _id, owner_id })', function(done) {
			const deleteOneSpy = sinon.spy(fakeModel, 'deleteOne');
			listingController.setModel(fakeModel);
			listingController.deleteByIdAndOwnerId(listingID, owner_id);
			setTimeout(function() {
				cAssert(deleteOneSpy.calledOnce, 'did not call deleteOne()');
				cAssert.deepEqual(deleteOneSpy.args[0][0], { _id: '123', owner_id: 'abc' },
					'did not call deleteOne() with proper arguments');
				done();
			}, 0);
		});
		it('should reject with error if deleteOne() rejects', function() {
			listingController.setModel(fakeModel);
			const promise = listingController.deleteByIdAndOwnerId(listingID, owner_id);
			return promise.should.be.rejectedWith('If you having DB prolemz i feel bad 4 u son');
		});
		it('should resolve with ?? if deleteOne() resolves', function() {
			sinon.stub(fakeModel, 'deleteOne').resolves({});
			listingController.setModel(fakeModel);
			let promise = listingController.deleteByIdAndOwnerId(listingID, owner_id);
			return promise.should.eventually.deep.equal({ title: 'haha' });
		});
	});
});