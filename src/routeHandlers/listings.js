function ensureNoValidationErrs(req, res, next, validationResult, { redirectTo }) {
	const errors = validationResult(req);
	if(!errors.isEmpty())
		return res.redirect(redirectTo);
	next();
}

function postListing(req, res, controller, validData) {
	validData.owner_id = req.user._id;
	controller.createListing(validData)
	.then(listing => {
		res.flash('post_success', 'Your listing was created!');
		res.redirect('/dashboard');
	})
	.catch(err => {
		res.flash('server_error', 'Something went wrong. Please try again');
		res.redirect('/dashboard');
	});
}

function ensureLTE10ActiveListings(req, res, next, controller, user_id) {
	controller.countBelongsTo(user_id)
	.then(count => {
		if(count >= 10) {
			res.flash('over_limit', 'You cannot have more than 10 active listings');
			res.redirect('/dashboard');
			return;
		}
		next();
	})
	.catch(err => {
		res.flash('server_error');
		res.redirect('/dashboard');
	})
}

function getById(req, res, controller) {
	controller.findByIdAndOwnerId(req.params.id, req.user._id)
	.then(listing => {
		if(listing)
			return res.render('listing', { listing });
		else
			return res.status(404).render('404');
	})
	.catch(err => {
		res.flash('server_error', 'Something went wrong. Please try again');
		res.redirect('/dashboard');
	});
}

function deleteById(req, res, controller) {
	let listingID = req.params.id;
	let owner_id = req.user._id;
	controller.deleteByIdAndOwnerId(listingID, owner_id)
	.then(result => {
		if(result.deletedCount === 0)
			return res.status(404).json({ msg: 'Listing does not exist' });
		return res.sendStatus(200);
	})
	.catch(err => {
		if(err.message.match(/Cast to ObjectId failed for value.+at path "_id" for model "Listing"/))
			return res.sendStatus(400);
		res.status(500).json({ msg: 'Something went wrong' });
	});
}

async function getUpdateForm(req, res, controller) {
	let listingID = req.params.id;
	let owner_id = req.user._id;
	try {
		let listing = await controller.findByIdAndOwnerId(listingID, owner_id);
		if(!listing)
			return res.status(404).render('404');
		res.render('updateListing', { listing });
	} catch(err) {
		res.flash('server_error', 'Something went wrong');
		return res.redirect('/dashboard');
	}
}

async function putListingById(req, res, controller, validData) {
	try {
		let listingID = req.params.id;
		let owner_id = req.user._id;
		let listing = await controller.updateByIdAndOwnerId(listingID, owner_id, validData);
		if(listing.n === 0) // none found
			return res.status(404).render('404');
		let [flashType, flashMsg] = (listing.nModified > 0 ? ['update_success', 'Changes saved!'] : ['no_update', 'Note: No changes made']);
		res.flash(flashType, flashMsg);
		return res.redirect('/dashboard');
	} catch(err) {
		res.flash('server_error', 'Something went wrong');
		res.redirect('/dashboard');
	}
}

module.exports = {
	getById,
	postListing,
	ensureNoValidationErrs,
	ensureLTE10ActiveListings,
	deleteById,
	getUpdateForm,
	putListingById
};
