const seed = require('../../../seed');
const assert = require('chai').assert;

// test interactions between listing controller and listing model
describe.only('#Listing_Controller', function() {
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
	describe('#findById', function() {
		it('should reject if passed an invalid id', function(done) {
			const invalidID = '123';
			listingController.findById(invalidID)
			.then(listing => done(new Error('should not be here')))
			.catch(err => done());
		});
		it('should resolve w real listing object if passed in a real listing id', function(done) {
			getSeroID()
			.then(id => postListing(id))
			.then(listingRes => listingRes._id)
			.then(listingId => listingController.findById(listingId))
			.then(listing => done())
			.catch(done);
		});
		it('should resolve w null if passed in a nonexistent id', function(done) {
			const nonexistentID = '5a302a283d3653249ce3ca71';
			listingController.findById(nonexistentID)
			.then(listing => {
				assert.isNull(listing);
				done();
			})
			.catch(done);
		});
	});
});

function getUsersID(fname) {
	return function() {
		return new Promise(function(resolve, reject) {
			const userModel = require('../../../src/models/User');
			userModel.findOne({ fname: fname })
			.then(userObj => resolve(userObj._id))
			.catch(reject);
		});
	};
}

function postListing(user_id) {
	return new Promise(function(resolve, reject) {
		const listingModel = require('../../../src/models/Listing');
		const validData = { title: 'bumble', description: 'new app', lang: 'JAVA', type: 'FULL_TIME', owner_id: user_id };
		let modelInstance = new listingModel(validData);
		modelInstance.save()
		.then(res => resolve(res))
		.catch(reject);
	});
}