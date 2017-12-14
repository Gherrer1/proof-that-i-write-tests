const getUsersID = require('./getUsersID');

function getSerosFirstListing() {
	return new Promise(function(resolve, reject) {
		getUsersID('Sero')()
		.then(id => {
			const listingModel = require('../../../src/models/Listing');
			return listingModel.findOne({ owner_id: id })
		})
		.then(listing => {
			resolve(listing);
		})
		.catch(reject);
	});
}

module.exports = getSerosFirstListing;