function postListing(user_id) {
	return new Promise(function(resolve, reject) {
		const listingModel = require('../../../src/models/Listing');
		const validData = { title: 'bumble', description: 'new app', lang: 'JAVA', type: 'FULL_TIME', owner_id: user_id };
		let modelInstance = new listingModel(validData);
		modelInstance.save()
		.then(res => resolve(res))
		.catch(reject);
	});
}

module.exports = postListing;