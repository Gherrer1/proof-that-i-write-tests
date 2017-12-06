let { check } = require('express-validator/check');
const vConstants = require('./validatorConstants');

const listingValidators = [
	check('title', 'Title missing')
		.exists()
		.isLength({ min: 1 })
		.trim(),
	check('description', 'Description missing')
		.exists()
		.isLength({ min: 1 })
		.trim(),
	check('type', 'Invalid type')
		.isIn(vConstants.listing.typeEnum),
	check('lang', 'Invalid language')
		.isIn(vConstants.listing.langEnum)
];

module.exports = listingValidators;