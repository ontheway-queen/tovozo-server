"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueManager = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = require("ioredis");
const redisConnection = {
    connection: new ioredis_1.Redis("redis://localhost"),
};
class QueueManager {
    constructor() {
        this.queues = new Map();
    }
    static getInstance() {
        if (!QueueManager.instance) {
            QueueManager.instance = new QueueManager();
        }
        return QueueManager.instance;
    }
    getQueue(queueName) {
        if (!this.queues.has(queueName)) {
            const queue = new bullmq_1.Queue(queueName, redisConnection);
            this.queues.set(queueName, queue);
        }
        return this.queues.get(queueName);
    }
}
exports.QueueManager = QueueManager;
