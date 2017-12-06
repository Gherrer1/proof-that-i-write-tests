let { check } = require('express-validator/check');
const vConstants = require('./validatorConstants').listing;

const listingValidators = [
	check('title', 'Title missing')
		.exists()
		.isLength({ min: 1 })
		.isLength({ max: vConstants.title.max })
			.withMessage(`Title cannot be greater than ${vConstants.title.max} characters long`)
		.trim(),
	check('description', 'Description missing')
		.exists()
		.isLength({ min: 1 })
		.isLength({ max: vConstants.description.max })
			.withMessage(`Description cannot be greater than ${vConstants.description.max} characters long`)
		.trim(),
	check('type', 'Invalid type')
		.isIn(vConstants.typeEnum),
	check('lang', 'Invalid language')
		.isIn(vConstants.langEnum)
];

module.exports = listingValidators;