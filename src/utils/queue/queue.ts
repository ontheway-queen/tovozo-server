import { Queue } from "bullmq";
import { Redis } from "ioredis";

const redisConnection = {
	connection: new Redis("redis://localhost"),
};

export class QueueManager {
	private static instance: QueueManager;
	private queues: Map<string, Queue>;

	private constructor() {
		this.queues = new Map();
	}

	public static getInstance(): QueueManager {
		if (!QueueManager.instance) {
			QueueManager.instance = new QueueManager();
		}
		return QueueManager.instance;
	}

	public getQueue(queueName: string): Queue {
		if (!this.queues.has(queueName)) {
			const queue = new Queue(queueName, redisConnection);
			this.queues.set(queueName, queue);
		}
		return this.queues.get(queueName)!;
	}
}
