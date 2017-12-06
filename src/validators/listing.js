let { check } = require('express-validator/check');
const vConstants = require('./validatorConstants');

const listingValidators = [
	check('title', 'Title missing')
		.exists(),
	check('description', 'Description missing')
		.exists(),
	check('type')
		.isIn(vConstants.listing.typeEnum),
	check('lang')
		.isIn(vConstants.listing.langEnum)
];

module.exports = listingValidators;