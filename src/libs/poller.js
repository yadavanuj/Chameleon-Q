class Poller {
	constructor(options) {
		this.options = options;
		if (!options) {
			throw new Error('Logical error');
		}

		this.frequency = options.frequency;
		this.maxBackOff = options.maxBackOff;
		this.lambda = options.lambda;
		this.handle = undefined;
		this.shouldStop = false;
	}

	start = async () => {
		if (!this.handle) {
			this.handle = setInterval(() => {
				if (!this.shouldStop) {
					this.lambda();
				} else {
					this.stop();
				}
			}, this.frequency);
		}
	};

	executor = async () => {};

	stop = () => {
		this.shouldStop = true;
		if (this.handle) {
			clearInterval(this.handle);
		}
	};
}

const createPoller = (options) => {
	return new Poller(options);
};

module.exports = {
	createPoller,
};
