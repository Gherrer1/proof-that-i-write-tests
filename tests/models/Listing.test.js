const Listing    = require('../../models/Listing');
const expect          = require('chai').expect;

describe('Listing Model', function() {

  let fields = {
      title: 'ABC',
      type: 'LONG_TERM',
      description: 'XYZ',
      lang: 'PYTHON',
      budget: 1,
      dueDate: new Date()
    };
  beforeEach(function() {
    var today = new Date();
    var tomorrow = today.setDate(today.getDate() + 1);
    fields = {
        title: 'ABC',
        type: 'LONG_TERM',
        description: 'XYZ',
        lang: 'PYTHON',
        budget: 1,
        dueDate: tomorrow
      };
  });

  describe('title field', function() {
    it('should return a validation error if left empty', function(done) {
      delete fields.title;
      let listing = new Listing(fields);
      listing.validate(err => {
        expect(err).to.exist;
        expect(err.errors.title).to.exist;
        expect(err.errors.title.message).to.match(/`title` is required/);
        done();
      });
    });
  });
  describe('type field', function() {
    it('should return a validation error if left empty', function(done) {
      delete fields.type;
      let listing = new Listing(fields);
      listing.validate(err => {
        expect(err).to.exist;
        expect(err.errors.type).to.exist;
        expect(err.errors.type.message).to.match(/`type` is required/);
        done();
      });
    });
    it('should return a validation error if value is not a correct enum value', function(done) {
      fields.type = 'full_timez';
      let listing = new Listing(fields);
      listing.validate(err => {
        expect(err).to.exist;
        expect(err.errors.type).to.exist;

        done();
      });
    });
    it('should not return a validation error if value is a correct enum value', function(done) {
      fields.type = 'FULL_TIME';
      let listing = new Listing(fields);
      listing.validate(err => {
        expect(err).to.be.null;
        done();
      });
    });
    it('should not return a validation error if value is a correct enum value but in lowercase', function() {
      fields.type = 'full_time';
      let listing = new Listing(fields);
      let errors = listing.validateSync();
      expect(errors).to.be.undefined;
    });
    it('should return a validation error if not a String because obviously its not a correct enum value', function() {
      fields.type = 45;
      let listing = new Listing(fields);
      var errors = listing.validateSync();
      expect(errors.errors.type).to.exist;
      expect(errors.errors.type.message).to.match(/is not a valid enum value/);
    });
  });
  describe('description field', function() {
    it('should return a validation error if left empty', function(done) {
      delete fields.description;
      let listing = new Listing(fields);
      listing.validate(err => {
        expect(err).to.exist;
        expect(err.errors.description).to.exist;
        expect(err.errors.description.message).to.match(/`description` is required/);
        done();
      });
    });
    it.skip('should return a validation error if value is not a String', function() {
      throw new Error('Doesnt matter if value isnt a string for some reason. Figure out how to enforce');
    });
  });
  describe('lang field', function() {
    it('should return a validation error if left empty', function(done) {
      delete fields.lang;
      let listing = new Listing(fields);
      listing.validate(err => {
        expect(err).to.exist;
        expect(err.errors.lang).to.exist;
        expect(err.errors.lang.message).to.match(/`lang` is required/);
        done();
      });
    });
    it('should return a validation error if value is not a correct enum value', function() {
      fields.lang = 'english';
      let instance = new Listing(fields);
      let errors = instance.validateSync();
      expect(errors.errors.lang.message).to.match(/is not a valid enum value/);
    });
    it('should not return a validation error if value is a correct enum value', function() {
      fields.lang = 'PYTHON';
      let listing = new Listing(fields);
      let errors = listing.validateSync();
      expect(errors).to.be.undefined;
    });
    it('should not return a validation error if value is a correct enum value but in lowercase', function() {
      fields.lang = 'python';
      let listing = new Listing(fields);
      let errors = listing.validateSync();
      expect(errors).to.be.undefined;
    });
    it('should return a validation error if value is not a String because obviously its not a correct enum value', function() {
      fields.lang = 45;
      let listing = new Listing(fields);
      let errors = listing.validateSync();
      expect(errors.errors.lang.message).to.match(/is not a valid enum value/);
    });
  });
  describe('budget field', function() {
    it('should return a validation error if value is a word and not a number', function() {
      fields.budget = 'budget';
      // fields.budget = '45';
      let listing = new Listing(fields);
      let errors = listing.validateSync()
      expect(errors.errors.budget.name).to.equal('CastError');
    });
    it('should return a validation error if value is less than 1', function() {
      fields.budget = 0;
      let listing = new Listing(fields);
      let errors = listing.validateSync();
      expect(errors.errors.budget).to.match(/is less than minimum/);
    });
    it('should not return a validation error if value is gte 1', function() {
      fields.budget = 1;
      let listing = new Listing(fields);
      let errors = listing.validateSync();
      expect(errors).to.be.undefined;
      fields.budget = 2;
      listing = new Listing(fields);
      errors = listing.validateSync();
      expect(errors).to.be.undefined;
    });
  });
  describe('dueDate field', function() {
    it('should return a validation error if left empty', function(done) {
      delete fields.dueDate;
      let listing = new Listing(fields);
      listing.validate(err => {
        expect(err).to.exist;
        expect(err.errors.dueDate).to.exist;
        expect(err.errors.dueDate.message).to.match(/`dueDate` is required/);
        done();
      });
    });
    it('should return a validation error if value is not a Date but a string', function() {
      fields.dueDate = 'date';
      let listing = new Listing(fields);
      let errors = listing.validateSync();
      expect(errors.errors.dueDate).to.exist;
    });
    it('should return a validation error if date is before now()', function() {
      fields.dueDate = 45;
      let listing = new Listing(fields);
      let errors = listing.validateSync();
      expect(errors.errors.dueDate).to.exist;
    });
  });
  describe('isOnline field', function() {
    it('should NOT return a validation error if left empty', function(done) {
      delete fields.isOnline;
      let listing = new Listing(fields);
      listing.validate(err => {
        expect(err).to.be.null;
        done();
      });
    });
    it('should NOT return a validation error if value is not a Boolean - allowed to be truthy/falsey', function() {
      fields.isOnline = 0;
      let listing = new Listing(fields);
      let errors = listing.validateSync();
      expect(errors).to.be.undefined;
      expect(listing.isOnline).to.be.false;
      fields.isOnline = 'yes';
      listing = new Listing(fields);
      errors = listing.validateSync();
      expect(errors).to.be.undefined;
      expect(listing.isOnline).to.be.true;
    });
    it('should have a default value of false', function() {
      delete fields.isOnline;
      expect(fields.isOnline).to.be.undefined;

      let listing = new Listing(fields);
      expect(listing.isOnline).to.be.false;
    });
  });
  describe('ninjaID field', function() {
    it('should have a default value of null if left empty', function() {
      delete fields.ninjaID;
      let listings = new Listing(fields);
      expect(listings.ninjaID).to.be.null;
    });
    it('should return a validation error if value is not an ObjectID', function() {
      fields.ninjaID = 45;
      let listings = new Listing(fields);
      let errors = listings.validateSync();
      expect(errors.errors.ninjaID.name).to.equal('CastError');
    });
  });
  describe('status field', function() {
    it('should return a validation error if value is not a correct enum value', function() {
      fields.status = 'butt';
      let listing = new Listing(fields);
      let errors = listing.validateSync();
      expect(errors.errors.status.message).to.match(/is not a valid enum value/);
    });
    it('should not return a validation error if value is a correct enum value even if lowercase', function() {
      fields.status = 'active';
      let listing = new Listing(fields);
      let errors = listing.validateSync();
      expect(errors).to.be.undefined;
    });
    it.skip('should return a validation error if value is not a String'); // doesnt matter
    it('should have a default value of "ACTIVE" if left empty', function() {
      delete fields.status;
      let listing = new Listing(fields);
      expect(listing.status).to.equal('ACTIVE');
      let errors = listing.validateSync();
      expect(errors).to.be.undefined;
    });
  });

  it('should not return a validation error if all required fields are passed in', function() {
    let listing = new Listing(fields);
    let errors = listing.validateSync();
    expect(errors).to.be.undefined;
  });
  it('should have default values of false, null, and "ACTIVE" for isOnline, ninjaID, and status if all 3 are ommited', function() {
    let listing = new Listing(fields);
    expect(listing.isOnline).to.equal(false);
    expect(listing.ninjaID).to.be.null;
    expect(listing.status).to.equal('ACTIVE');
    expect(listing.validateSync()).to.be.undefined;
  });
});
