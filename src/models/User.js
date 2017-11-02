const mongoose		= require('mongoose');
					  				require('mongoose-type-email');
const Schema			= mongoose.Schema,
	  ObjectId			= Schema.ObjectId;
const constants		= require('../validators/validatorConstants');

mongoose.Promise = global.Promise;

const isNinjaEnum = ['NO', 'YES', 'PENDING', 'REJECTED'];

const UserSchema = new Schema({
	fname: { type: String, maxlength: constants.user.fname.max, required: true, match: constants.user.fname.regex },
	username: { type: String, required: true, lowercase: true, minlength: 7, maxlength: 15, unique: true },// unique?
	email: { type: mongoose.SchemaTypes.Email, required: true, unique: true }, // unique? //SchemaTypes.Email must automatically lowercase it for you
	isNinja: { type: String, default: 'NO', enum: isNinjaEnum, uppercase: true },
	password: { type: String, required: true, minlength: 10, maxlength: 20 }
	// isNinja: string, enum, default: non
	//
});

module.exports = mongoose.model('User', UserSchema);
