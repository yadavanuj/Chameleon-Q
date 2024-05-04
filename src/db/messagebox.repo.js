const db = require('./database');
const { v4: uuidv4 } = require('uuid');

class MessageBoxRepo {
	// NOTE: No Check For Time & Data Validation etc.

	enqueue = async (processBy, message) => {
		const params = [];
		params.push(uuidv4());
		params.push(processBy);
		params.push(null);
		params.push(message);
		params.push(null);

		return await db.emptyOrRow(await db.query(
			'CALL sp_EnqueueMessage(?, ?, ?, ?, ?)',
			params
		));
		
	};

	allocateMessage = async (
		batchSize,
		batchTimeWindowInMinutes,
		lockTimeoutInSeconds,
		callerId
	) => {
		try {
			return await db.emptyOrRow(
				await db.query('CALL sp_AllocateMessages(?, ?, ?, ?)', [
					batchSize,
					batchTimeWindowInMinutes,
					lockTimeoutInSeconds,
					callerId,
				])
			);
		} catch (err) {
			console.error('', err);
		}
	};

	details = async (processedInLastXMinutes) => {
		const params = [`00:${processedInLastXMinutes}:00`];
		return await db.emptyOrRow(
			await db.query('CALL sp_GetQueueDetails(?)', params)
		);
	};
}

const messageBoxRepo = new MessageBoxRepo();
module.exports = { messageBoxRepo };
