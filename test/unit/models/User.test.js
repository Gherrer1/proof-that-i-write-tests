const UserModel 		= require('../../../src/models/User');
const constants 		= require('../../../src/validators/validatorConstants');
const expect				= require('chai').expect;
const assert				= require('chai').assert;

describe.only('UserModel', function() {

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
		it('should throw a validation error if fname missing', function() {
			delete fields.fname;
			let user = new UserModel(fields);
			let error = user.validateSync();
			expect(error.errors.fname.message).to.match(/`fname` is required/);
		});
		it('should not have a validation error if fname is anywhere between 1 and 20 characters long', function() {
			var validLengthdNames = ['a', 'aa', 'aba', 'a aa', 'abcdg', /* ... */ 'eighteen chars wee', 'nineteen chars nine', 'twentycharstwentycha'];
			var fieldsObjects = validLengthdNames.map(name => {
				return { fname: name, username: fields.username, email: fields.email, password: fields.password };
			});
			var users = fieldsObjects.map(fields => new UserModel(fields));
			users.forEach(user => {
				let error = user.validateSync();
				expect(error).to.be.undefined;
			});
		});
		it(`should throw a validation error if fname is more than ${constants.user.fname.max} characters long`, function() {
			fields.fname = 'abcdefghijklmnopqrstu'; // 21 chars long
			let user = new UserModel(fields);
			let error = user.validateSync();
			expect(error.errors.fname).to.exist;
			expect(error.errors.fname.kind).to.equal('maxlength');
			expect(error.errors.fname.message).to.match(/is longer than the maximum allowed length/);
		});
		it('should throw a validation error if fname present but 0 characters long', function() {
			fields.fname = '';
			let user = new UserModel(fields);
			let error = user.validateSync();
			expect(error.errors.fname.kind).to.equal('required');
			expect(error.errors.fname.message).to.match(/`fname` is required/);
		});
		it('should not throw a validation error if fname does conform to regex', function() {
			var validNames = ['jerry withspaces', 'jerry with\'neil', 'j. erry', 'look ma two  spaces', 'kareem-abdul jabbar'];
			var users = validNames.map(name => {
				return { fname: name, username: fields.username, email: fields.email, password: fields.password };
			}).map(fieldsObj => new UserModel(fieldsObj));
			users.forEach(user => {
				let error = user.validateSync();
				expect(error).to.be.undefined;
			});
		});
		it('should throw a validation error if fname does not conform to regex', function() {
			var invalidNames = ['jerry1', 'Verylegit1Name', 'jerry!', 'j@rry', '?erry', 'j{}rry', 'j+rry', 'je#y', 'je:;y'];
			var users = invalidNames.map(name => {
				return { fname: name, username: fields.username, email: fields.email, password: fields.password };
			}).map(fieldsObj => new UserModel(fieldsObj));
			users.forEach(user => {
				let error = user.validateSync();
				expect(error.errors.fname).to.exist;
				expect(error.errors.fname.message).to.match(/is invalid/);
				expect(error.errors.fname.kind).to.equal('regexp');
			});
		});
	});

	describe('username field', function() {
		it('should return a validation error if username missing', function() {
			delete fields.username;
			let user = new UserModel(fields);
			let error = user.validateSync();
			expect(error.errors.username.message).to.match(/`username` is required/);
		});
		it('should throw validation error if it doesnt conform to our username regex', function() {
			var invalidUsernames = ['w space', 'W SPACE', 'symbols!', 'SYMBOLS!', 'symbols1#', 'SYMBOLS1#', 'symbols$', 'SYMBOLS$', '5ymbols', '5YMBOLS', '.aberrr', '.ABERRR', 'a.berr?', 'A.BERR?', '000pss', '000PSS', 'Ape head', 'APE HEAD'];
			var users = invalidUsernames.map(invalidUsername => { return { fname: fields.fname, username: invalidUsername, email: fields.email, password: fields.password }; })
																	.map(fieldsObj => new UserModel(fieldsObj));
			users.forEach(user => {
				let error = user.validateSync();
				expect(error, 'There are no errors gleaned from validateSync()').to.exist;
				assert.exists(error.errors.username, 'there are no errors with username contrary to what we expect');
				expect(error.errors.username.message).to.match(/is invalid/);
				expect(error.errors.username.kind).to.equal('regexp');
			});
		});
		it('should not throw a validation error if it does conform to our username regex', function() {
			var validUsernames = ['a2345', 'A2345', 'a....', 'A....', 'a..55', 'A..55', 'a1.2.3.4.5', 'A1.2.3.4.5'];
			var users = validUsernames.map(validUsername => { return { fname: fields.fname, username: validUsername, email: fields.email, password: fields.password }; })
																	.map(fieldsObj => new UserModel(fieldsObj));
			users.forEach(user => {
				let error = user.validateSync();
				expect(error, 'There are errors though there shouldnt be').to.be.undefined;
			});
		});
		it('should save the username as all lowercase letters', function() {
			fields.username = 'FuNhOuSe';
			let expectedUsername = fields.username.toLowerCase();
			let user = new UserModel(fields);
			expect(user.username).to.equal(expectedUsername);
		});
		it(`should return a validation error if username is less than ${constants.user.username.min} characters or greater than ${constants.user.username.max} characters`, function() {
			fields.username = 'four'; // 4 chars
			let user = new UserModel(fields);
			let error = user.validateSync();
			expect(error, 'No errors found but there should have been').to.exist;
			expect(error.errors.username).to.exist;
			expect(error.errors.username.kind).to.equal('minlength');
			fields.username = 'thirteenbih13'; // 13 chars
			user = new UserModel(fields);
			error = user.validateSync();
			expect(error, 'No errors found but there should have been').to.exist;
			expect(error.errors.username).to.exist;
			expect(error.errors.username.kind).to.equal('maxlength');
		});
		it(`should return no validation error if username is ${constants.user.username.min} to ${constants.user.username.max} characters long, inclusive`, function() {
			const validLengthdUsernames = ['five5', 'sixsix', 'seven77', /* ... */ 'tententen.', 'e11leven.11', 'twelvetwelve'];
			const users = validLengthdUsernames.map(validUsername => { return { fname: fields.fname, username: validUsername, email: fields.email, password: fields.password }; })
																				 .map(fieldsObj => new UserModel(fieldsObj));
			users.forEach(user => {
				const error = user.validateSync();
				expect(error, 'error existed, it shouldnt have').to.be.undefined;
			});
		});
	});

	describe('email field', function() {
		it('should return a validation error if email missing', function() {
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
		it(`should return a validation error if email is greater than ${constants.user.email.max} chars long`, function() {
			fields.email = 'onehundreddamnchaehundredharacterslongonehundreddamncharaterslongs@email.com'; // 76 chars
			let user = new UserModel(fields);
			let error = user.validateSync();
			expect(error, 'There should have been an error raised').to.exist;
			expect(error.errors.email).to.exist;
			expect(error.errors.email.message).to.match(/is longer than the maximum allowed length/);
			expect(error.errors.email.kind).to.equal('maxlength');
		});
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
		it('should return a validation error if password missing', function() {
			delete fields.password;
			let user = new UserModel(fields);
			let error = user.validateSync();
			expect(error.errors.password.message).to.match(/`password` is required/);
		});
		it('should return a validation error if password is present but is 0 chars long', function() {
			throw new Error('red-green refactor');
		});
		it(`should not be over ${constants.user.password.model.max} characters long \n\t(every bcrypt password is 60 chars long, but maybe one day Ill use a diff hasher)`, function() {
			throw new Error('red-green refactor');
		});
		it.skip('should be minimum 10 characters and maximum 20 characters', function() { // might not be applicable anymore
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
		it('should be case sensitive', function() {
			const expectedPassword = 'aBcDeFGhIjKlMn';
			fields.password = expectedPassword;
			let user = new UserModel(fields);
			expect(user.password).to.equal(expectedPassword);
		});
	});
});
