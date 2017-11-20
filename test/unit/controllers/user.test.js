const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const assert = chai.assert;
const should = chai.should();
const sinon = require('sinon');

describe('#UserController', function() {
  const userController = require('../../../src/controllers/user');

  it('should not have a this.model set until calling setModel on it', function() {
    expect(userController.model).to.be.undefined;
    var fakeModel = function() {};
    userController.setModel(fakeModel);
    expect(userController.model).to.equal(fakeModel);
    delete userController.model;
  });

  afterEach(function() {
    delete userController.model;
  });

  describe('#ensureEmailAndUsernameUnique', function() {
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
      const expectedFindParam = { $or: [{ email }, { username }] };
      const stub = sinon.stub(model, 'find');
      stub.resolves([]);
      userController.setModel(model);
      userController.ensureEmailAndUsernameUnique(email, username)
      .then(function() {
        assert(stub.calledOnce, 'stub not called once');
        expect(stub.args[0][0], `stub not called with ${expectedFindParam}`).to.deep.equal(expectedFindParam);
      })
      .catch(err => {
        throw err;
      })
      .then(done, done);
    });
    it('tbh not sure what happens if undefined parameters passed in');
    it('should resolve the promise with the users found who have that username or email', function() {
      const fakeUsersFound = [{ fname: 'U1' }];
      var mockedModel = {
        find() { return Promise.resolve(fakeUsersFound); }
      };
      userController.setModel(mockedModel);
      var promise = userController.ensureEmailAndUsernameUnique(email, username);

      const fakeUsers2Found = [{ fname: 'U1' }, { fname: 'U2' }];
      mockedModel = {
        find() { return Promise.resolve(fakeUsers2Found); }
      };
      userController.setModel(mockedModel)
      var promise2 = userController.ensureEmailAndUsernameUnique(email, username);

      return Promise.all([
        expect(promise).to.eventually.become(fakeUsersFound),
        expect(promise2).to.eventually.become(fakeUsers2Found)
      ]);
    });
    it('should resolve the promise with empty array if 0 users found (via model.find) with username or password', function() {
      var foundUsers = [];
      const mockedModel = {
        find() { return Promise.resolve(foundUsers); }
      };
      userController.setModel(mockedModel);
      var promise = userController.ensureEmailAndUsernameUnique(email, username);
      return expect(promise).to.eventually.become(foundUsers);
    });
  });

  describe('#createUser', function() {
    let validData;
    let fakeModel;
    let fakeInstance;

    beforeEach(function() {
      validData = { fname: 'Joey', email: 'joey@email.com', username: 'joeywheeler', password: 'joeyjoeyjoey', passwordConf: 'joeyjoeyjoey' };
      fakeModel = function(obj) {
        obj.save = function() {};
        return obj
      };
    });

    it('should return a promise', function() {
      userController.setModel(fakeModel);
      const promise = userController.createUser(validData)
      promise.then(() => {}).catch(() => {}); // just to get rid of warning
      expect(promise.then).to.exist;
      expect(promise.catch).to.exist;
    });
    it('should call the model as a constructor once with the validData fields', function(done) {
      const stubModel = sinon.stub().returns(validData);
      userController.setModel(stubModel);
      userController.createUser(validData)
      .then(user => {
        assert(stubModel.calledOnce, 'model was not called once');
        assert(stubModel.calledWithNew(), 'model function was not called with new');
      })
      .catch(err => {
        assert(stubModel.calledOnce, 'model was not called once');
        assert(stubModel.calledWithNew(), 'model function was not called with new');
      })
      .then(done, done);
    });
    it('should call save() on a new User object', function(done) {
      let { fname, email, username, password } = validData;
      let modelInstance = { fname, email, username, password };
      modelInstance.save = function() {
        return Promise.resolve({ fname, email, username, password });
      }

      let spy = sinon.spy(modelInstance, 'save');
      fakeModel = function(data) {
        return modelInstance;
      }

      userController.setModel(fakeModel);
      userController.createUser(validData)
      .then(user => {
        assert(spy.calledOnce, 'modelInstance.save() was not called once, it was called ' + spy.callCount + ' times');
      })
      .catch(err => {
        throw err;
      })
      .then(done, done);
    });
    it('should reject if save() throws an error', function() {
      let { fname, username, email, password } = validData;
      let modelInstance = { fname, username, email, password };
      let saveErrorMessage = 'Could not save to DB';
      modelInstance.save = function() {
        throw new Error(saveErrorMessage);
      }
      fakeModel = function(data) {
        return modelInstance;
      }

      userController.setModel(fakeModel);
      let promise = userController.createUser(validData);
      return promise.should.be.rejectedWith(saveErrorMessage);
    });
    it('should resolve with a user object if all goes well', function() {
      let { fname, username, email, password } = validData;
      let modelInstance = { fname, username, email, password };
      let expectedResolve = { fname, username, email, password };
      modelInstance.save = function() {
        return Promise.resolve(expectedResolve);
      }
      fakeModel = function(data) {
        return modelInstance;
      }
      userController.setModel(fakeModel);
      let promise = userController.createUser(validData);
      return promise.should.eventually.deep.equal(expectedResolve);
    });
  });

  describe('#validateLoginCredentials', function() {
    const expectedHashedValue = 'hashed ;)';
    let email, password, hasher, fakeModel;

    beforeEach(function() {
      email = 'valid@email.com';
      password = '12345678';
      hasher = { hash: function(password, saltRounds) { return Promise.resolve(expectedHashedValue) } };
      fakeModel = {
        findOne() {
          return new Promise(function(resolve, reject) {
            resolve({});
          })
        }
      }
    });
    // this function should only ever be called with a legitimate email and password
    it('should return a Promise', function() {
      userController.setModel(fakeModel);
      var promise = userController.validateLoginCredentials(email, password, hasher);
      expect(promise.then).to.exist;
      expect(promise.catch).to.exist;
    });
    it('should call model.findOne with email', function(done) {
      var spy = sinon.spy(fakeModel, 'findOne');
      userController.setModel(fakeModel);
      userController.validateLoginCredentials(email, password, hasher)
      .then(user => {
        expect(spy.calledOnce, 'model.findOne() was not called once').to.be.true;
        expect(spy.calledWith(email), 'model.findOne() not called with email').to.be.true;
      })
      .catch(err => {
        expect(spy.calledOnce, 'model.findOne() was not called once').to.be.true;
        expect(spy.args[0][0], 'model.findOne() not called with email').to.deep.equal({ email });
      })
      .then(done, done);
    });
    it('should reject with error if the model throws an error', function() {
      const expectedErrorMessage = 'Error with DB';
      fakeModel.findOne = sinon.stub().rejects(new Error('Error with DB'));
      userController.setModel(fakeModel);

      var promise = userController.validateLoginCredentials(email, password, hasher);
      return promise.should.be.rejectedWith(expectedErrorMessage);
    });
    it('should resolve to false if no user with that email is found', function() {
      fakeModel.findOne = sinon.stub().resolves(null);
      userController.setModel(fakeModel);

      return userController.validateLoginCredentials(email, password, hasher).should.eventually.be.false;
    });
    it('should reject with error if password hasher throws an error', function() {
      hasher.hash = sinon.stub().rejects(new Error('Problem with hasher bro'));
      userController.setModel(fakeModel);

      var promise = userController.validateLoginCredentials(email, password, hasher);
      return promise.should.be.rejectedWith('Problem with hasher bro');
    });
    it('should resolve to false if hash result does not match found users hashed password', function() {
      fakeModel.findOne = sinon.stub().resolves({ password: 'hahaha' });
      hasher.hash = sinon.stub().resolves('hehehe');
      userController.setModel(fakeModel);

      return userController.validateLoginCredentials(email, password, hasher).should.eventually.be.false;
    });
    it('should resolve to user obj without password if user found and hashed passwords match', function() {
      const expectedUser = { fname: 'Jay', username: 'jayboutit', email: 'blaaaahh@email.com'};
      fakeModel.findOne = sinon.stub().resolves({ fname: 'Jay', username: 'jayboutit', email: 'blaaaahh@email.com', password: 'hahaha' });
      hasher.hash = sinon.stub().resolves('hahaha');
      userController.setModel(fakeModel);

      return userController.validateLoginCredentials(email, password, hasher).should.eventually.deep.equal(expectedUser);
    });
  });

  describe('#findById', function() {
    it('should return a promise', function() {
      throw new Error('red-green refactor');
    });
    it('should reject with error if model throws an error', function() {
      throw new Error('red-green refactor');
    });
    it('should resolve with false if no user exists with that id', function() {
      throw new Error('red-green refactor');
    });
    it('should resolve with true a user does exist with that id', function() {
      throw new Error('red-green refactor');
    });
  });
});
