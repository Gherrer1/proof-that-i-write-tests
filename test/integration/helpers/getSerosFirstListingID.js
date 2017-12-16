const getSerosFirstListing = require('./getSerosFirstListing');

module.exports = function getSerosFirstListingID() {
	return new Promise(function(resolve, reject) {
		getSerosFirstListing()
		.then(listing => resolve(listing._id))
		.catch(reject);
	});
}