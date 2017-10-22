const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const assert = chai.assert;
const should = chai.should;
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
    // delete userController.model;
  });

  describe('ensureEmailAndUsernameUnique', function() {
    const email = 'me@email.com';
    const username = 'me';
    // just unit tests, we'll test the actual db query later
    afterEach(function() {
      // userController.model = undefined;
    });

    it('should return a promise', function() {
      var promise = userController.ensureEmailAndUsernameUnique(username, email);
      promise.catch(() => {}); // to get rid of UnhandledRejectionWarning
      expect(promise.then).to.exist;
      expect(promise.catch).to.exist;
    });
    it('mock play', function() {
      var myAPI = { method10: function() {} };
      var mock = sinon.mock(myAPI);
      mock.expects('method10').twice().withArgs(1, 2);
      myAPI.method10(1, 2);
      myAPI.method10(1, 2);
      mock.verify();
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
      // return expect(promise).to.eventually.be.rejected && expect(promise2).to.eventually.be.fulfilled;
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
});
