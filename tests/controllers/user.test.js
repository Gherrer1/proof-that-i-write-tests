const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const assert = chai.assert;
const should = chai.should();
const sinon = require('sinon');

describe.only('UserController', function() {
  const userController = require('../../controllers/user');

  it('should not have a this.model set until calling setModel on it', function() {
    expect(userController.model).to.be.undefined;
    var fakeModel = { haha: 'lol' };
    userController.setModel(fakeModel);
    expect(userController.model).to.equal(fakeModel);
    delete userController.model;
  });

  afterEach(function() {
    delete userController.model;
  });

  describe('ensureEmailAndUsernameUnique', function() {
    const email = 'me@email.com';
    const username = 'me';
    // just unit tests, we'll test the actual db query later
    afterEach(function() {
      delete userController.model;
    });

    it('should return a promise', function() {
      var promise = userController.ensureEmailAndUsernameUnique(username, email);
      promise.catch(() => {}); // to get rid of UnhandledRejectionWarning
      expect(promise.then).to.exist;
      expect(promise.catch).to.exist;
    });
    it('should call model.find on the parameters passed into it', function(done) {
      const model = {
        find: function(email, username) { return new Promise(function(resolve, reject) { resolve(); }); }
      };
      const stub = sinon.stub(model, 'find');
      stub.resolves([]);
      userController.setModel(model);
      userController.ensureEmailAndUsernameUnique(email, username)
      .then(function() {
        assert(stub.calledOnce, 'stub not called once');
        assert(stub.calledWith(email, username), `stub not called with Email:${email} and Username:${username}`);
      })
      .catch(err => {
        throw err;
      })
      .then(done, done);
    });
    it('tbh not sure what happens if undefined parameters passed in');
    it('should reject that promise if 1 or more users found (via model.find) with username or password', function() {
      const fakeUsersFound = [{ fname: 'U1' }];
      var mockedModel = {
        find() { return Promise.resolve(fakeUsersFound); }
      };
      userController.setModel(mockedModel);
      var promise = userController.ensureEmailAndUsernameUnique(email, username);
      // now make sure it rejects with 2 users found too
      fakeUsersFound.push({ fname: 'U2' });
      var promise2 = userController.ensureEmailAndUsernameUnique(email, username);
      // how to test multiple promises
      return Promise.all([
        expect(promise).to.eventually.be.rejected,
        expect(promise2).to.eventually.be.rejected
      ]);
    });
    it('should resolve the promise if 0 users found (via model.find) with username or password', function() {
      const mockedModel = {
        find() { return Promise.resolve([]); }
      };
      userController.setModel(mockedModel);
      var promise = userController.ensureEmailAndUsernameUnique(email, username);
      return expect(promise).to.eventually.be.fulfilled;
    });
  });

  describe('createUser', function() {
    let validData;
    let fakeHasher;
    let fakeModel;
    let fakeInstance;

    beforeEach(function() {
      validData = { fname: 'Joey', email: 'joey@email.com', username: 'joeywheeler', password: 'joeyjoeyjoey', passwordConf: 'joeyjoeyjoey' };
      fakeHasher = { hash() { return Promise.resolve() } };
      let fakeModel = {
        save() {
          return new Promise(function(resolve, reject) {
            delete validData.passwordConf;
            validData.password = 'hashed ;)';
            resolve(validData);
          })
        }
      };
    });

    it('should return a promise', function() {
      userController.setModel(fakeModel);
      const promise = userController.createUser(validData, fakeHasher)
      expect(promise.then).to.exist;
      expect(promise.catch).to.exist;
    });
    it('should call passwordHasher once with the password field of the validData object passed in', function(done) {
      const stub = sinon.stub(fakeHasher, 'hash');
      stub.resolves('hashed ;)');
      userController.setModel(fakeModel);
      userController.createUser(validData, fakeHasher)
      .then(user => {
        stub.restore();
        assert(stub.calledOnce, 'fakeHasher.hash was not called once');
        assert(stub.calledWith(validData.password));
      })
      .catch(err => {
        stub.restore();
        assert(stub.calledOnce, 'fakeHasher.hash was not called once');
        assert(stub.calledWith(validData.password));
        throw err;
      })
      .then(done, done);
    });
    it('should reject if passwordHasher rejects', function() {
      const stub = sinon.stub(fakeHasher, 'hash');
      const errorMessage = 'custom fakeHasher error message :)';
      stub.rejects(new Error(errorMessage));
      userController.setModel(fakeModel);
      var promise = userController.createUser(validData, fakeHasher);
      return promise.should.be.rejectedWith(Error); //expect(promise).to.eventually.rejectWith(Error, errorMessage);
    });
    it('should call the model as a constructor once with the validData fields and the newly hashed password if hashing goes well', function() {
      throw new Error('red-green refactor');
    });
    it('should call save() on a new User object with the validData fields and the newly hashed password if hashing goes well', function() {
      let { fname, username, email } = validData;
      let hashedPassword = 'hashed ;)';
      let fakeUserInstance = { fname, username, email, password: hashedPassword };
      fakeUserInstance.save = function() { return Promise.resolve({ fname, username, email, hashedPassword }) };

      throw new Error('red-green refactor');
    });
    it('should reject if save() throws an error', function() {
      throw new Error('red-green refactor');
    });
    it('should resolve with a user object if all goes well', function() {
      throw new Error('red-green refactor');
    });
  });
});
