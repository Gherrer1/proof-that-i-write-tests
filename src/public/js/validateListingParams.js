(function() {
		let form = document.querySelector('form');
		let titleInput = document.querySelector('#titleInput');
		let descriptionInput = document.querySelector('#descInput');
		
		form.onsubmit = handleSubmit;

		function onlyWhiteSpace(string) {
			return string === '';
		}

		function tooLong(string, max) {
			return string.length > max;
		}

		function markInvalid(target) {
			target.classList.add('is-invalid');
		}

		function markValid(target) {
			target.classList.remove('is-invalid');
		}

		function handleSubmit(event) {
			let titleValue = titleInput.value.trim();
			let descValue = descriptionInput.value.trim();
			let titleMaxLen = 75;
			let descMaxLen = 1000;
			
			// html required attribute will handle the case where input is completely empty
			if(!onlyWhiteSpace(titleValue) && !onlyWhiteSpace(descValue) && !tooLong(titleValue, titleMaxLen) && !tooLong(descValue, descMaxLen))
				return;

			event.preventDefault();

			if(onlyWhiteSpace(titleValue) || tooLong(titleValue, titleMaxLen))
				markInvalid(titleInput);
			else
				markValid(titleInput);
			if(onlyWhiteSpace(descValue) || tooLong(descValue, descMaxLen))
				markInvalid(descriptionInput);
			else
				markValid(descriptionInput);
		}
})();