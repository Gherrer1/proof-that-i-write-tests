// add event listener to delete button
// TODO: find out how to test this kind of code
// TODO: if status code !== 200, we should populate some div with an error message
(function() {

	function removeListingFromDOM(target) {
		const li = target.parentNode;
		const ul = li.parentNode;
		ul.removeChild(li);
	}

	function ajaxDeleteListing(id) {
		return fetch(`/listings/${id}`, 
			{ method: 'delete', credentials: 'include' });
	}

	const deleteListingButtons = document.querySelectorAll('#delete-listing-btn');
	deleteListingButtons.forEach(function addListenerToDelButton(deleteButton) {
		deleteButton.addEventListener('click', function handleClick(event) {
			if(confirm('Are you sure you want to delete this listing?') === false)
				return;

			const listingID = event.target.parentNode.id;
			ajaxDeleteListing(listingID)
				.then(data => {
					if(data.status === 200) {
						removeListingFromDOM(event.target);
					}
				});
		});
	});
})();