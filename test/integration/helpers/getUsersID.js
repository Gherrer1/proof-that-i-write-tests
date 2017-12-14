function getUsersID(fname) {
	return function() {
		return new Promise(function(resolve, reject) {
			const userModel = require('../../../src/models/User');
			userModel.findOne({ fname: fname })
			.then(userObj => resolve(userObj._id))
			.catch(reject);
		});
	};
}

module.exports = getUsersID;