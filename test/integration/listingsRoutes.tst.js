const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../src/app');
const seed = require('../../seed');
const sinon = require('sinon');
const {simulateLogIn} = require('./helpers');
const listingController = require('../../src/controllers/listing');
const getSerosFirstListingID = require('./helpers/getSerosFirstListingID');

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
		it('should NOT redirect to /dashboard with over_limit flash if user has more than 10 active listings', function() {
			// in flows
		});
	});
	describe('[POST /listings]', function() {
		it('should redirect to /login if not logged in, response should not contain return_to CFM', function(done) {
			request(app).post('/listings')
				.expect(302).expect('Location', '/login')
				.end(function(err, res) {
					if(err)
						return done(err);
					expect(res.headers['set-cookie']).to.be.undefined;
					done();
				});
		});
		it('should redirect to /listings/new if there are validation errors, no error messages bc clientside js handles that', function(done) {
			// Just one class of errors is used in the example below, we just want to make sure that on errors we redirect to /listings/new
			const data = { title: 'b', description: '  ', lang: 'python', type: 'full_time' };
			simulateLogIn()
			.then(sessionCookie => {
				request(app).post('/listings')
					.set('Cookie', [sessionCookie])
					.send(data)
					.expect(302).expect('Location', '/listings/new')
					.end(function(err, res) {
						if(err)
							return done(err);
						expect(res.headers['set-cookie'].length).to.equal(1); // just session cookie
						done();
					});
			})
			.catch(done);
		});
		it('should redirect to /dashboard with over_limit flash if user has more than 10 active listings', function() {
			// in flows :)
		});
		it('should redirect to /dashboard with create_success flash if all goes well', function(done) {
			let validListingData = { title: 'b', description: 'b', lang: 'PYTHON', type: 'FULL_TIME' };
			simulateLogIn()
			.then(sessionCookie => {
				request(app).post('/listings')
					.set('Cookie', [sessionCookie])
					.send(validListingData)
					.expect(302).expect('Location', '/dashboard')
					.end(function(err, res) {
						if(err)
							return done(err);
						let cookies = res.headers['set-cookie'];
						expect(cookies.length, 'Expected 2 cookies: session & post_success flash').to.equal(2);
						expect(cookies[0]).to.match(/cookie_flash_message.+post_success/);
						expect(cookies[1]).to.match(/thekid/);
						done();
					});
			})
			.catch(done);
		});
		it('should redirect to /dashboard with server_error flash if server error occurs', function(done) {
			let controllerStub = sinon.stub(listingController, 'createListing').rejects('HAHAHA');
			let invalidListingData = { // missing due_date
				title: 'b', description: 'b',
				lang: 'PYTHON', type: 'FULL_TIME'
			};
			simulateLogIn()
			.then(sessionCookie => {
				request(app).post('/listings')
					.set('Cookie', [sessionCookie])
					.send(invalidListingData)
					.expect(302).expect('Location', '/dashboard')
					.end(function(err, res) {
						controllerStub.restore();
						if(err)
							return done(err);
						let cookies = res.headers['set-cookie'];
						expect(cookies.length, 'Expected 2 cookies: session & server_error flash').to.equal(2);
						expect(cookies[0]).to.match(/cookie_flash_message.+server_error.+Something.+went.+wrong/);
						expect(cookies[1]).to.match(/thekid/);
						done();
					});
			})
			.catch(done);
		});
	});
	describe('[GET /listings/:id]', function() {
		it('should redirect to /login if not logged in', function(done) {
			request(app).get('/listings/123')
				.expect(302).expect('Location', '/login', done);
		});
		it('should redirect to 404 page if listing not found', function(done) {
			const nonexistentID = '5a302a283d3653249ce3ca71';
			simulateLogIn()
			.then(sessionCookie => {
				request(app).get(`/listings/${nonexistentID}`)
					.set('Cookie', [sessionCookie])
					.expect(404)
					.expect(/404/, done);
			})
			.catch(done);
		});
		it('should redirect to /dashboard with server_error flash if listing search fails', function(done) {
			const findStub = sinon.stub(listingController, 'findByIdAndOwnerId').rejects(new Error('Problem querying DB'));
			const id = '5a302a283d3653249ce3ca71'; // reason this should fail is not the id but a db query failure
			simulateLogIn()
			.then(sessionCookie => {
				request(app).get(`/listings/${id}`)
					.set('Cookie', [sessionCookie])
					.expect(302).expect('Location', '/dashboard')
					.end(function(err, res) {
						findStub.restore();
						if(err)
							return done(err);
						let cookies = res.headers['set-cookie'];
						expect(cookies.length).to.equal(2);
						expect(cookies[0]).to.match(/cookie_flash_message.+server_error/);
						done();
					});
			})
			.catch(done);
		});
		it('should redirect to 404 page if existing listing ID but doesnt match owner_id', function(done) {
			let listingId;
			getSerosFirstListingID()
			.then(listingID => {
				listingId = listingID;
				return simulateLogIn('sato');
			})
			.then(sessionCookie => {
				request(app).get(`/listings/${listingId}`)
					.set('Cookie', [sessionCookie])
					.expect(404)
					.expect(/404/, done);
			})
			.catch(done);
		});
		it('should show listing details if listing found and belongs to user', function(done) {
			let listingId;
			getSerosFirstListingID()
			.then(listingID => {
				listingId = listingID;
				return simulateLogIn('sero');
			})
			.then(sessionCookie => {
				request(app).get(`/listings/${listingId}`)
					.set('Cookie', [sessionCookie])
					.expect(200)
					.expect(/id="listing_title"/)
					.expect(/id="listing_desc/)
					.expect(/ruby/, done); //expendable
			})
			.catch(done);
		});
	});
	describe.only('[DELETE /listings/:id]', function() {
		let seroSessionCookie;
		beforeEach(function(done) {
			simulateLogIn('sero')
			.then(sessCook => {
				seroSessionCookie = sessCook;
				done();
			})
			.catch(done);
		});
		it('should not return HTML on success - this is an API call', function(done) {
			getSerosFirstListingID()
			.then(listingID => {
				request(app).delete(`/listings/${listingID}`)
					.set('Cookie', [seroSessionCookie])
					.expect(200)
					.expect(/^OK$/, done);
			})
			.catch(done);
		});
		it('shoudl return JSON on failure, not HTML - this is an API call', function(done) {
			const nonexistentListingID = '5a302a283d3653249ce3ca71';
			request(app).delete(`/listings/${nonexistentListingID}`)
				.set('Cookie', [seroSessionCookie])
				.expect(404,
					{ msg: 'Listing does not exist' },
					done);
		});
		it('should send 401 (Not Authorized) if not logged in', function(done) {
			request(app).delete('/listings/123')
				.expect(401, done);
		});
		it('should send 404 if listing doesnt exist', function(done) {
			const nonexistentListingID = '5a302a283d3653249ce3ca71';
			request(app).delete(`/listings/${nonexistentListingID}`)
				.set('Cookie', [seroSessionCookie])
				.expect(404,
					{ msg: 'Listing does not exist' },
					done);
		});
		it('should send 404 (Forbidden) if listing exists but doesnt belong to user', function(done) {
			let bakugosSession;
			simulateLogIn('bakugo')
			.then(sessCook => {
				bakugosSession = sessCook;
				return getSerosFirstListingID()
			})
			.then(serosListingID => {
				request(app).delete(`/listings/${serosListingID}`)
					.set('Cookie', [bakugosSession])
					.expect(404,
						{ msg: 'Listing does not exist'},
						done);
			})
			.catch(done);
		});
		it('should send 400 (Bad Request) if :id param isnt a valid ObjectID', function(done) {
			request(app).delete('/listings/123')
				.set('Cookie', [seroSessionCookie])
				.expect(400, done)
		});
		it('should send 200 status if listing deleted successfully (implicit that listing exists and belongs to user)', function(done) {
			getSerosFirstListingID()
			.then(listingID => {
				request(app).delete(`/listings/${listingID}`)
					.set('Cookie', [seroSessionCookie])
					.expect(200)
					.expect(/^OK$/, done);
			})
			.catch(done);
		});
		it('should send 500 status if listing deleteOne fails', function(done) {
			const expectedError = new Error('if u havin db probz i feel bad 4 u son');
			const deleteByIdAndOwnerIdStub = sinon.stub(listingController, 'deleteByIdAndOwnerId').rejects(expectedError);
			getSerosFirstListingID()
			.then(listingID => {
				request(app).delete(`/listings/${listingID}`)
					.set('Cookie', [seroSessionCookie])
					.expect(500)
					.end(function(err, res) {
						deleteByIdAndOwnerIdStub.restore();
						if(err)
							return done(err);
						expect(res.body).to.deep.equal({
							msg: 'Something went wrong'
						});
						done();
					});
			})
			.catch(done);
		});
	});
});

/**
 * *1 CFM = cookie flash message
 */
