console.log('hey');

(function() {
		let form = document.querySelector('form');
		let titleInput = document.querySelector('#titleInput');
		let descriptionInput = document.querySelector('#descInput');
		
		form.onsubmit = handleSubmit;

		function isWhiteSpace(string) {
			return string === '';
		}

		function markInvalid(target) {
			// console.log(target.classList.add);
			target.classList.add('is-invalid');
		}

		function markValid(target) {
			target.classList.remove('is-invalid');
		}

		function handleSubmit(event) {
			let titleValue = titleInput.value.trim();
			let descValue = descriptionInput.value.trim();
			
			if(!isWhiteSpace(titleValue) && !isWhiteSpace(descValue))
				return;

			event.preventDefault();

			if(isWhiteSpace(titleValue))
				markInvalid(titleInput);
			else
				markValid(titleInput);
			if(isWhiteSpace(descValue))
				markInvalid(descriptionInput);
			else
				markValid(descriptionInput);

			console.log('bitch you better add a value hoe');
			// if(titleInput.value !== 'password') {
			// 	console.log('ion think so lil fella');
			// 	return event.preventDefault();
			// }
			// event.preventDefault();

			// console.log(titleInput);
			// console.log(descriptionInput);

			// if(titleInput.value === 'password') {
			// 	console.log('trueeee');
			// 	return true;
			// }
			// return false;
		}
})();