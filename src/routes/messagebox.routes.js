const repo = require('../db/messagebox.repo');
const timeUtils = require('../utils/time.utils');

const enqueue = async (req, res) => {
	const enqueuRequest = req.body;
	const { message } = enqueuRequest;
	const result = await repo.messageBoxRepo.enqueue(
		message.data.processBy,
		JSON.stringify(message)
	);
	res.send({ result });
};

const details = async (req, res) => {
	const detailsRequest = req.body;
	const { proccessedInLastXMinutes } = detailsRequest;
	const result = await repo.messageBoxRepo.details(proccessedInLastXMinutes);
	res.send(result);
};

const allocate = async (req, res) => {
	const batchSize = process.env.POLLER_BATCH_SIZE;
	const batchTimeWindowLimit = process.env.POLLER_BATCH_TIME_WINDOW;
	const pollerLockTimeout = process.env.POLLER_LOCK_TIMEOUT;
	const callerId = global.callerId;

	const result = await repo.messageBoxRepo.allocateMessage(
		batchSize,
		batchTimeWindowLimit,
		pollerLockTimeout,
		callerId
	);
	res.send(result);
};

const register = (app) => {
	app.post('/api/enqueue', enqueue);
	app.post('/api/details', details);
	app.get('/api/allocate', allocate);
};

module.exports = {
	enqueue,
	details,
	register,
};
