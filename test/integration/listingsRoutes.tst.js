const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../src/app');
const seed = require('../../seed');
const {simulateLogIn} = require('./helpers');

describe('#Listings_Routes', function() {
	beforeEach(function(done) {
		seed.seed()
		.then(done, done);
	});
	describe('[GET /listings/new]', function() {
		it('should redirect to /login if not logged in, response should contain return_to CFM^*1', function(done) {
			request(app).get('/listings/new')
				.expect(302).expect('Location', '/login')
				.end(function(err, res) {
					if(err)
						return done(err);
					const cookie = res.headers['set-cookie'][0];
					expect(cookie).to.match(/buma/);
					expect(res.headers['set-cookie'].length).to.equal(1);
					done();
				});
		});
		it('should render create listings form if logged in', function(done) {
			simulateLogIn()
			.then(sessionCookie => {
				request(app).get('/listings/new')
					.set('Cookie', [sessionCookie])
					.expect(/id="titleInput"/, done);
			})
			.catch(err => { console.log(err); done(err); })
		});
	});
});

/**
 * *1 CFM = cookie flash message 
 */