const seed = require('../../../seed');
const sinon = require('sinon');
const _ = require('lodash');
const assert = require('chai').assert;
const getSerosFirstListingID = require('../helpers/getSerosFirstListingID');
const getUsersID = require('../helpers/getUsersID');

// test interactions between listing controller and listing model
describe('#Listing_Controller', function() {
	const getSeroID = getUsersID('Sero');
	const getBakugoID = getUsersID('Bakugo');
	let listingController = require('../../../src/controllers/listing');

	before(function() {
		const listingModel = require('../../../src/models/Listing');
		listingController.setModel(listingModel);
	});
	after(function(done) {
		seed.seed().then(done, done);
	});

	beforeEach(function(done) {
		seed.seed().then(done, done);
	});

	describe('#countBelongsTo', function() {
		it('should return the number of listings that belong to user', function(done) {
			getSeroID()
			.then((id) => {
				return listingController.countBelongsTo(id);
			})
			.then(count => {
				assert.equal(count, 3, 'Expected 3 listings to belong to sero');
				done();
			})
			.catch(done);
		});
		it('should reject if passed an invalid owner_id', function(done) {
			const invalidID = 'abc';
			listingController.countBelongsTo(invalidID)
			.then(count => done(new Error('expected a rejection with error')))
			.catch(err => done());
		});
		it('should resolve with 0 if passed a nonexistent owner_id', function(done) {
			const nonexistentID = '5a302a283d3653249ce3ca71';
			listingController.countBelongsTo(nonexistentID)
			.then(count => {
				assert.equal(count, 0);
				done();
			})
			.catch(done);
		});
	});
	describe('#findBelongsTo', function() {
		it('should return an array of listings that belong to user', function(done) {
			getSeroID()
			.then(id => {
				return listingController.findBelongsTo(id);
			})
			.then(listings => {
				assert(Array.isArray(listings))
				assert.isAbove(listings.length, 0);
				done();
			})
			.catch(done);
		});
		it('should reject if passed an invalid owner_id', function(done) {
			const invalidID = 'abc';
			listingController.findBelongsTo(invalidID)
			.then(listings => {
				done(new Error('Should not have gotten here'));
			})
			.catch(err => {
				done();
			});
		});
		it('should resolve with [] if passed a nonexistent owner_id', function(done) {
			const nonexistentID = '5a302a283d3653249ce3ca71';
			listingController.findBelongsTo(nonexistentID)
			.then(listings => {
				assert(Array.isArray(listings));
				assert.equal(listings.length, 0);
				done();
			})
			.catch(done);
		});
	});
	describe('#findByIdAndOwnerId', function() {
		it('should reject if passed an invalid id', function(done) {
			const invalidID = '123';
			const validOwnerID = '5a302a283d3653249ce3ca71';
			listingController.findByIdAndOwnerId(invalidID, validOwnerID)
			.then(listing => done(new Error('should not be here')))
			.catch(err => done());
		});
		it('should reject if passed an invalid owner_id', function(done) {
			const validId = '5a302a283d3653249ce3ca71';
			const invalidOwnerId = '123';
			listingController.findByIdAndOwnerId(validId, invalidOwnerId)
			.then(listing => done(new Error('should not be here')))
			.catch(err => done());
		});
		it('should resolve w real listing object if passed in a real listing id and matching owner_id', function(done) {
			let seroID;
			getSeroID()
			.then(owner_id => {
				seroID = owner_id;
				return getSerosFirstListingID()
			})
			.then(listingId => listingController.findByIdAndOwnerId(listingId, seroID))
			.then(listing => {
				if(listing)
					return done();
				done(new Error('Did not receive listing'));
			})
			.catch(done);
		});
		it('should resolve w null if passed in a nonexistent id but existing owner_id', function(done) {
			const nonexistentID = '5a302a283d3653249ce3ca71';
			getSeroID()
			.then(seroID => listingController.findByIdAndOwnerId(nonexistentID, seroID))
			.then(listing => {
				assert.isNull(listing);
				done();
			})
			.catch(done);
		});
		it('should resolve w null if passed in an existing id but nonmatching owner_id', function(done) {
			let bakugosID;
			getBakugoID()
			.then(id => {
				bakugosID = id;
				return getSerosFirstListingID();
			})
			.then(serosListingId => {
				return listingController.findByIdAndOwnerId(serosListingId, bakugosID);
			})
			.then(listing => {
				assert.isNull(listing);
				done();
			})
			.catch(done);
		});
		it('should resolve w null if passed in nonexistent id and nonexistent owner_id', function(done) {
			const nonexistentID = '5a302a283d3653249ce3ca71';
			const nonexistentOwnerID = '5a302a283d3653249ce3ca71';
			listingController.findByIdAndOwnerId(nonexistentID, nonexistentOwnerID)
			.then(listing => {
				assert.isNull(listing);
				done();
			})
			.catch(done);
		});
	});
	describe('#deleteByIdAndOwnerId', function() {
		it('should reject if listingID is invalid ObjectID', function(done) {
			let invalidListingId = 'abc';
			getSeroID()
			.then(seroID => listingController.findByIdAndOwnerId(invalidListingId, seroID))
			.then(res => {
				done(new Error('shouldnt be here'));
			})
			.catch(err => {
				assert.match(err.message, /Cast to ObjectId failed for value.+at path "_id" for model "Listing"/);
				done();
			});
		});
		it('should reject if ownerID is invalid ObjectID', function(done) {
			const invalidUserID = 'abc';
			getSerosFirstListingID()
			.then(listingID => listingController.deleteByIdAndOwnerId(listingID, invalidUserID))
			.catch(err => {
				assert.match(err.message, /Cast to ObjectId failed for value.+at path "owner_id" for model "Listing"/);
				done();
			})
			.catch(done);
		});
		it('should resolve with null if ownerID is undefined', function(done) {
			getSerosFirstListingID()
			.then(listingID => listingController.deleteByIdAndOwnerId(listingID))
			.then(res => {
				assert.equal(res.deletedCount, 0);
				done();
			})
			.catch(done);
		});
		it('should resolve with null if listingID exists but ownerID doesnt match', function(done) {
			let bakugosID;
			getBakugoID()
			.then(bakugos_id => {
				bakugosID = bakugos_id;
				return getSerosFirstListingID();
			})
			.then(serosListingId => listingController.deleteByIdAndOwnerId(serosListingId, bakugosID))
			.then(res => {
				assert.equal(res.deletedCount, 0);
				done();
			})
			.catch(done);
		});
		it('should resolve with null if ownerID exists but listingID doesnt match', function(done) {
			done(); // essentially the same test as the one above
		});
		it('should resolve with listing if ownerID and listingID match', function(done) {
			let serosID;
			getSeroID()
			.then(seros_id => {
				serosID = seros_id;
				return getSerosFirstListingID()
			})
			.then(serosListingId => listingController.deleteByIdAndOwnerId(serosListingId, serosID))
			.then(res => {
				assert.equal(res.deletedCount, 1);
				done();
			})
			.catch(done);
		});
	});
	describe.only('#updateByIdAndOwnerId', function() {
		let serosID, serosFirstListingId;
		let fakeUpdateObj;
		beforeEach(async function() {
			fakeUpdateObj = { title: 'Hey lol' };
			serosID = await getSeroID();
			serosFirstListingId = await getSerosFirstListingID();
		});
		it('should return a promise', function() {
			let promise = listingController.updateByIdAndOwnerId();
			promise.catch(() => {});
			assert.exists(promise.then);
			assert.exists(promise.catch);
		});
		it('[implementation] should call model.updateOne() with { listingID, ownerID } and ' +
				'{ title, description, type, lang } and { runValidators: true }', async function() {
			const listingModel = require('../../../src/models/Listing');
			let updateOneStub = sinon.spy(listingModel, 'updateOne');
			let updateObj = {
				title: 'Ayyyy Lmao',
				description: 'Raid Anna',
				type: 'FULL_TIME',
				lang: 'C'
			};
			let updateObjDeepClone = _.cloneDeep(updateObj);
			let result = await listingController.updateByIdAndOwnerId(serosFirstListingId, serosID, updateObj);
			updateOneStub.restore();
			assert(updateOneStub.calledOnce, 'Didnt call updateOne()');
			assert.deepEqual(updateOneStub.args[0][0], { _id: serosFirstListingId, owner_id: serosID });
			assert.deepEqual(updateOneStub.args[0][1], { $set: updateObjDeepClone });
			assert.deepEqual(updateOneStub.args[0][2], { runValidators: true });
		});
		it('should reject if listingID isnt a valid MongoDB ObjectId', async function() {
			const invalidListingId = '123';
			let error = await listingController.updateByIdAndOwnerId(invalidListingId, serosID, fakeUpdateObj).catch(err => err);
			assert.match(error.message, /Cast to ObjectId failed for value/);
		});
		it('should reject if ownerID isnt a valid MongoDB ObjectId', async function() {
			const invalidOwnerId = '123';
			let errorMessage = await listingController.updateByIdAndOwnerId(serosFirstListingId, invalidOwnerId, fakeUpdateObj).catch(err => err.message);
			assert.match(errorMessage, /Cast to ObjectId failed for value/);
		});
		it('should reject if updateOne() fails', async function() {
			const listingModel = require('../../../src/models/Listing');
			let updateOneStub = sinon.stub(listingModel, 'updateOne').rejects(new Error('feel bad 4 u son'));
			let errorMessage = await listingController.updateByIdAndOwnerId(serosFirstListingId, serosID, fakeUpdateObj).catch(err => err.message);
			updateOneStub.restore();
			assert.match(errorMessage, /feel bad 4 u son/);
		});
		it('result.n should be 0 if no listing found with BOTH listingID and ownerID matching', async function() {
			const nonexistentListingID = '5a302a283d3653249ce3ca71';
			let promise1 = listingController.updateByIdAndOwnerId(nonexistentListingID, serosID, fakeUpdateObj);
			const nonexistentUserID = '5a302a283d3653249ce3ca71';
			let promise2 = listingController.updateByIdAndOwnerId(serosFirstListingId, nonexistentUserID, fakeUpdateObj);
			const [result1, result2] = await Promise.all([promise1, promise2]);
			assert.equal(result1.n, 0, 'result1: n should be 0 because 0 documents should match');
			assert.equal(result2.n, 0, 'result2: n should be 0 because 0 documents should match');
		});
		it('should reject if tries to change lang to unacceptable enum value', async function() {
			fakeUpdateObj.lang = 'java';
			let errorMessage = await listingController.updateByIdAndOwnerId(serosFirstListingId, serosID, fakeUpdateObj).catch(err => err.message);
			assert.match(errorMessage, /Validation failed: lang:.+is not a valid enum value/);
		});
		it('should reject if tries to change type to unacceptable enum value', function() {
			return Promise.reject(new Error('red-green refactor'));
		});
		it('should reject if tries to change description to too long (or any other validation error)', function() {
			return Promise.reject(new Error('red-green refactor'));
		});
		it('should reject if tries to change title to too long (or any other validation error)', function() {
			return Promise.reject(new Error('red-green refactor'));
		});
	});
});
