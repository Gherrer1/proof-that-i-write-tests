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
      // throw new Error('red-green refactor');
    });
  });
});
