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
			
		});
		it('should render create listings form if logged in', function() {
			
		});
	});
});

/**
 * *1 CFM = cookie flash message 
 */