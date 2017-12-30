const Listing    = require('../../../src/models/Listing');
const expect          = require('chai').expect;
const mongoose    = require('mongoose');
// const ObjectID  = require()

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
        dueDate: tomorrow,
        owner_id: mongoose.Types.ObjectId('59c836e0459ef10a62e0665b')
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
    it('should return a validation error if field is longer than 75 chars long', function(done) {
      fields.title = 'this  is my really long title lol fuckkkkk i dont know what to say oh well l';
      expect(fields.title.length).to.be.above(75);
      let listing = new Listing(fields);
      listing.validate(err => {
        expect(err).to.exist;
        expect(err.errors.title).to.exist;
        expect(err.errors.title.message).to.match(/is longer than the maximum allowed length/);
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
    it('should return a validation error if field is over 1000 chars long', function(done) {
      fields.description = 'Lorem ipsum dolor sit amettt, affert munere cu mea. Sed scaevola luptatum disputationi cu. Purto phaedrum neglegentur ius cu. Doctus splendide vix no. Mea at sale laboramus, virtute disputando ut pro, an regione singulis vix. Qui eu diam admodum, ut latine omittam his, altera malorum eu has. Cu dignissim urbanitas eam, mei aliquando theophrastus et.Vim te expetendis interesset definitiones, accusata constituto nec an. Eius nobis no vim, ea mea dicit concludaturque. Pri ut brute viris splendide, mea assum petentium ne. Per deterruisset reprehendunt id, eu sed iriure senserit reprehendunt, voluptua adipisci no est.Et pro malis zril, usu graeco dolorum ne, est liber dolore eu. Cu eam vide impetus atomorum. Ad nec luptatum liberavisse, at feugiat dissentiunt intellegebat quo, pro an ubique nostro. Vix at facilisis persecuti, equidem consulatu ut vel. Ad vidit omittam qui, id postulant iudicabit ullamcorper sed, ue ibit has no, dicam lucilius atomorum sit ne, mea no etiam nominavi vulputate.';
      expect(fields.description.length).to.above(1000);
      let listing = new Listing(fields);
      listing.validate(err => {
        expect(err).to.exist;
        expect(err.errors.description).to.exist;
        expect(err.errors.description.message).to.match(/is longer than the maximum allowed length/);
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
  describe.skip('dueDate field', function() {
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
  describe('owner_id field', function() {
    it('should return a validation error if left empty', function() {
      delete fields.owner_id;
      let listing = new Listing(fields);
      let error = listing.validateSync();
      expect(error.errors.owner_id).to.exist;
    });

    it('should throw an error if you try to assign a non ObjectID to it', function() {
      fields.owner_id = 123;
      let listing = new Listing(fields);
      let error = listing.validateSync();
      expect(error.errors.owner_id.message).to.match(/Cast to ObjectID failed for value "123"/);
    });

    it('should throw no errors if you assign a perfectly ok ObjectID to it', function() {
      let listing = new Listing(fields);
      let error = listing.validateSync();
      expect(error).to.be.undefined;
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
