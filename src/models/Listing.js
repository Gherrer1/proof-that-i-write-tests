const mongoose          = require('mongoose'),
      Schema            = mongoose.Schema,
      ObjectId          = Schema.ObjectId;
const constants         = require('./listingConstants')
mongoose.Promise = global.Promise;

const languageEnum = constants.langEnum;
const typeEnum = constants.typeEnum;
const statusEnum = ['ACTIVE', 'LOCKED', 'COMPLETED'];

const ListingSchema = new Schema({
  title       : { type: String, required: true },
  type        : { type: String, enum: typeEnum, required: true, uppercase: true },
  description : { type: String, required: true },
  lang        : { type: String, required: true, enum: languageEnum, uppercase: true },
  budget      : { type: Number, min: 1, required: false },
  dueDate     : { type: Date, required: true, validate: validate },
  isOnline    : { type: Boolean, default: false },
  ninjaID     : { type: ObjectId, default: null },
  status      : { type: String, enum: statusEnum, uppercase: true, default: 'ACTIVE' },
  owner_id    : { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

const ListingModel = mongoose.model('Listing', ListingSchema);

module.exports = ListingModel;

function validate(v) {
  return v > new Date();
}
