const UserModel 		= require('../../../src/models/User');
const expect			= require('chai').expect;

describe('UserModel', function() {

	let fields;

	beforeEach(function() {
		fields = {
			fname: 'Jake',
			username: 'jakerolf23',
			email: 'jake@email.com',
			password: 'abc123xyz4'
		};
	});

	describe('fname field', function() {
		it('should throw a validation error if fname left empty', function() {
			delete fields.fname;
			let user = new UserModel(fields);
			let error = user.validateSync();
			expect(error.errors.fname.message).to.match(/`fname` is required/);
		});
	});

	describe('username field', function() {
		it('should return a validation error if left empty', function() {
			delete fields.username;
			let user = new UserModel(fields);
			let error = user.validateSync();
			expect(error.errors.username.message).to.match(/`username` is required/);
		});
		it.skip('should throw validation error if it doesnt conform to our username regex');
		it('should save the username as all lowercase letters', function() {
			fields.username = 'FuNhOuSe';
			let expectedUsername = fields.username.toLowerCase();
			let user = new UserModel(fields);
			expect(user.username).to.equal(expectedUsername);
		});
		it('should return a validation error if username is less than 7 characters or greater than 15 characters', function() {
			fields.username = 'aaaaaa'; // 6 chars
			let user = new UserModel(fields);
			let error = user.validateSync();
			expect(error.errors.username).to.exist;
			fields.username = 'aaaaaaaaaaaaaaaa'; // 16 chars
			user = new UserModel(fields);
			error = user.validateSync();
			expect(error.errors.username).to.exist;
		});
		it('should return no validation error if username is 7 to 15 characters long, inclusive', function() {
			fields.username = 'aaaaaaaaaa'; // 10 chars
			let user = new UserModel(fields);
			let error = user.validateSync();
			expect(error).to.be.undefined;
		});
		it('should be unique but idk how to test this yet');
	});

	describe('email field', function() {
		it('should return a validation error if left empty', function() {
			delete fields.email;
			let user = new UserModel(fields);
			let error = user.validateSync();
			expect(error.errors.email.message).to.match(/`email` is required/);
		});
		it('should return a validation error if invalid email', function() {
			fields.email = 'blah.com';
			let user = new UserModel(fields);
			let error = user.validateSync();
			expect(error.errors.email).to.exist;
		});
		it('should return no validation error if valid email', function() {
			fields.email = 'jake@email.com';
			let user = new UserModel(fields);
			let error = user.validateSync();
			expect(error).to.be.undefined;
		});
		it.skip('should be unique but idk how to test that yet');
		it('should be saved as all lowercase when object instantiated', function() {
			fields.email = 'JAKE@EMAIL.COM';
			let expectedEmail = fields.email.toLowerCase();
			let user = new UserModel(fields);
			expect(user.email).to.equal(expectedEmail);
		});
	});

	describe('isNinja field', function() {
		it('should have a default value of "NO" when not instantiated with a value', function() {
			let user = new UserModel(fields);
			expect(user.isNinja).to.equal('NO');
			expect(user.validateSync()).to.be.undefined;
		});
		it('should return a validation error when value is not a proper enum', function() {
			fields.isNinja = 'MAYBE';
			let user = new UserModel(fields);
			let error = user.validateSync();
			expect(error.errors.isNinja.message).to.match(/is not a valid enum value/);
		});
		it('should have the value it is instantiated with provided it is a proper enum, even if lowercase', function() {
			fields.isNinja = 'pendInG';
			let user = new UserModel(fields);
			expect(user.isNinja).to.equal('PENDING');
			let errors = user.validateSync();
			expect(errors).to.be.undefined;
		});
	});

	describe('password field', function() {
		it('should be minimum 10 characters and maximum 20 characters', function() {
			fields.password = '123456789'; // 9 characters
			let user = new UserModel(fields);
			let error = user.validateSync();
			expect(error.errors.password).to.exist;
			expect(error.errors.password.message).to.match(/is shorter than the minimum allowed length/);
			fields.password = '111111111111111111111'; // 21 characters
			user = new UserModel(fields);
			error = user.validateSync();
			expect(error.errors.password).to.exist;
			expect(error.errors.password.message).to.match(/is longer than the maximum allowed length/);
			fields.password = '1111111111'; // 10 chars
			user = new UserModel(fields);
			error = user.validateSync();
			expect(error).to.be.undefined;
			fields.password = '11111111111111111111'; // 20 chars
			user = new UserModel(fields);
			error = user.validateSync();
			expect(error).to.be.undefined;
		});
		it('should return a validation error if left empty', function() {
			delete fields.password;
			let user = new UserModel(fields);
			let error = user.validateSync();
			expect(error.errors.password.message).to.match(/`password` is required/);
		});
		it('should be case sensitive', function() {
			const expectedPassword = 'aBcDeFGhIjKlMn';
			fields.password = expectedPassword;
			let user = new UserModel(fields);
			expect(user.password).to.equal(expectedPassword);
		});
	});
});
