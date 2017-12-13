const publicAPI = {
	setModel,
	createListing,
	countBelongsTo,
	findBelongsTo,
	findById
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

function countBelongsTo(owner_id) {
	const model = this.model;
	return new Promise(function(resolve, reject) {
		model.count({ owner_id })
		.then(resolve)
		.catch(reject);
	});
}

function findBelongsTo(owner_id) {
	const model = this.model;
	return new Promise(function(resolve, reject) {
		model.find({ owner_id })
		.then(resolve)
		.catch(reject);
	});
}

function findById(id) {
	const model = this.model;
	return new Promise(function(resolve, reject) {
		model.findById(id)
		.then(resolve)
		.catch(reject);
	});
}

module.exports = publicAPI;
