const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../src/app');
const seed = require('../../seed');

describe('#Listings_Routes', function() {
	beforeEach(function(done) {
		seed.seed()
		.then(done, done);
	});
	describe('[GET /listings/new]', function() {
		it('should redirect to /login if not logged in, response should contain return_to CFM^*1', function() {
			throw new Error('red-green refactor');
		});
		it('should render create listings form if logged in', function() {
			throw new Error('red-green refactor');
		});
	});
});

/**
 * *1 CFM = cookie flash message 
 */