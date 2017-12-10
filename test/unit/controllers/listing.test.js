const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

describe('#ListingController', function() {
	const listingController = require('../../../src/controllers/listing');

	it('should not have a this.model until its manually set by calling setModel on it', function() {
		expect(listingController.model).to.be.undefined;
		const fakeModel = function() {};
		listingController.setModel(fakeModel);
		expect(listingController.model).to.equal(fakeModel);
		delete listingController.model;
	});
});