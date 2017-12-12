const publicAPI = {
	setModel,
	createListing
};

function setModel(model) {
	this.model = model;
}

function createListing(validData) {
	const model = this.model;
	return new Promise(function(resolve, reject) {
		const listing = new model(validData);
		listing.save().then(resolve, reject)
	});
}

module.exports = publicAPI;
