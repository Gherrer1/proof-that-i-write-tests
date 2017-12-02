const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../src/app');
const seed = require('../../seed');
const {simulateLogIn} = require('./helpers');

describe('#Listings_Routes', function() {
	beforeEach(function(done) {
		seed.seed().then(done, done);
	});
	after(function(done) {
		seed.seed().then(done, done);
	});
	describe('[GET /listings/new]', function() {
		it('should redirect to /login if not logged in, response should contain return_to CFM^*1', function(done) {
			request(app).get('/listings/new')
				.expect(302).expect('Location', '/login')
				.end(function(err, res) {
					if(err)
						return done(err);
					const cookie = res.headers['set-cookie'][0];
					expect(cookie).to.match(/cookie_flash_message=.+return_to.+listings.+new/);
					expect(res.headers['set-cookie'].length).to.equal(1);
					done();
				});
		});
		it('should render create listings form if logged in', function(done) {
			simulateLogIn()
			.then(sessionCookie => {
				request(app).get('/listings/new')
					.set('Cookie', [sessionCookie])
					.expect(/<form method="POST" action="\/listings">/, done);
			})
			.catch(err => { console.log(err); done(err); })
		});
		it('should redirect to /dashboard with over_limit flash if user has more than 10 active listings');
	});
	describe('[POST /listings]', function() {
		it('should redirect to /login if not logged in, response should contain return_to CFM');
		it('should redirect to /listings/new if there are validation errors, no error messages bc clientside js handles that');
		it('should redirect to /dashboard with over_limit flash if user has more than 10 active listings');
		it('should redirect to /dashboard with create_success flash if all goes well');
		it('should redirect to /dashboard with server_error flash if server error occurs');
	});
});

/**
 * *1 CFM = cookie flash message
 */
