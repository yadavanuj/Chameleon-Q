// Keeping the code old style
function getUri(protocol) {
	return protocol + Window.chameleon.Host;
}

let Communicator = (function () {
	let clientId = Window.chameleon.ClientId;

	function createMessage() {
		let processAfterSecondsInput = document.querySelector(
			'#processAfterSecondsInput'
		).value;
		
		let date = new Date();
		let processBy = new Date(date.getTime()).toISOString().slice(0, 19).replace('T', ' ');
		
		return {
			message: {
				metadata: { clientId },
				data: {
					processBy,
					content: Faker.Lorem.sentence(1),
				},
			}
		};
	}

	return {
		generateData: function () {
			let messageCount = document.querySelector('#messageCountInput').value;

			for (let index = 0; index < messageCount; index++) {
				const message = createMessage();
				ClientPresenter.render(message);

				fetch(getUri(Window.chameleon.Protocols.HTTP) + '/api/enqueue', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(message),
				})
					.then((response) => {
						return response.json();
					})
					.then((data) => {
						console.log(data);
					})
					.catch((e) => {
						console.log(e);
					});
			}
		},

		stopProcessing: function () {
			fetch(getUri(Window.chameleon.Protocols.HTTP) + '/api/stop-processing', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			})
				.then((response) => {
					return response.json();
				})
				.then((data) => {
					console.log(data);
				})
				.catch((e) => {
					console.log(e);
				});
		},

		startProcessing: function () {
			fetch(getUri(Window.chameleon.Protocols.HTTP) + '/api/start-processing', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			})
				.then((response) => {
					return response.json();
				})
				.then((data) => {
					console.log(data);
				})
				.catch((e) => {
					console.log(e);
				});
		},
	};
})();
