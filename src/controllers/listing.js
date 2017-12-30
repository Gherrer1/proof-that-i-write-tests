const publicAPI = {
	setModel,
	createListing,
	countBelongsTo,
	findBelongsTo,
	findByIdAndOwnerId,
	deleteByIdAndOwnerId,
	updateByIdAndOwnerId
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

function findByIdAndOwnerId(_id, owner_id) {
	const model = this.model;
	return new Promise(function(resolve, reject) {
		model.findOne({ _id, owner_id })
		.then(resolve)
		.catch(reject);
	});
}

function deleteByIdAndOwnerId(_id, owner_id) {
	const model = this.model;
	return new Promise(function(resolve, reject) {
		model.deleteOne({ _id, owner_id })
		.then(resolve)
		.catch(reject);
	});
}

function updateByIdAndOwnerId(_id, owner_id, update) {
	const model = this.model;
	return new Promise(function(resolve, reject) {
		model.updateOne({ _id, owner_id }, { $set: update }, { runValidators: true })
		.then(resolve)
		.catch(reject);
	});
}

module.exports = publicAPI;
