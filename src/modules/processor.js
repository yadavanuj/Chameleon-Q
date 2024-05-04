const { createPoller } = require("../libs/poller");
const repo = require('../db/messagebox.repo');

class Processor {
    constructor() {
        const frequency = process.env.POLLER_FREQUENCY;
        const maxBackOff = process.env.POLLER_MAX_BACKOFF;

        const params = {
            frequency,
            maxBackOff,
            lambda: this._inner
        }
        this.poller = createPoller(params);
    }

    startProcessing = async () => {
        this.poller.start();
    }

    stopProcessing = () => {
        this.poller.stop();
    }


    _inner = async () => {
        const batchSize = process.env.POLLER_BATCH_SIZE;
        const batchTimeWindowLimit = process.env.POLLER_BATCH_TIME_WINDOW;
        const pollerLockTimeout = process.env.POLLER_LOCK_TIMEOUT;
        const callerId = global.callerId;

        const result = await repo.messageBoxRepo.allocateMessage(batchSize, batchTimeWindowLimit, pollerLockTimeout,callerId);
        console.log("", result);
        result?.forEach(row => {
            if (global.socket) {
                global.socket.send(JSON.stringify({id: row["id"], message: row["message"], acquiredAt: row["acquired_at"]}));
            } else {
                console.log("Error with socket connection");
            }
        });
    }
}

const createProcessor = () => {
    return new Processor();
}

module.exports = {
    createProcessor,
}