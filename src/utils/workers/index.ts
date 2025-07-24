// JobPostExpireWorker.ts - manages the worker side only
import { Worker } from "bullmq";
import Redis from "ioredis";
import JobPostWorker from "./jobPost/jobPostWorker";

// export class JobPostExpireWorker {
// 	private worker: Worker | null = null;
// 	private jobWorker = new JobPostWorker();
// 	private redisUrl: string;

// 	constructor(redisUrl = "redis://localhost") {
// 		this.redisUrl = redisUrl;
// 	}

// 	start() {
// 		if (this.worker) return;

// 		const connection = new Redis(this.redisUrl);

// 		this.worker = new Worker(
// 			"expire-job-post",
// 			async (job) => await this.jobWorker.expireJobPost(job),
// 			{ connection }
// 		);

// 		this.worker.on("completed", (job) => {
// 			console.log(`✅ Job expired: ${job.id}`);
// 		});

// 		this.worker.on("failed", (job, err) => {
// 			console.error(`❌ Job failed: ${job?.id}`, err);
// 		});

// 		console.log("Expire job worker started");
// 	}

// 	async stop() {
// 		if (!this.worker) return;
// 		await this.worker.close();
// 		this.worker = null;
// 	}
// }

export default class Workers {
	private worker: Worker | null = null;
	private jobWorker = new JobPostWorker();
	private redisUrl: string;

	constructor(redisUrl = "redis://localhost") {
		this.redisUrl = redisUrl;
		this.callWorkers();
	}

	private callWorkers() {
		this.ExpireJob();
	}

	public ExpireJob() {
		if (this.worker) return;

		const connection = new Redis(this.redisUrl, {
			maxRetriesPerRequest: null,
		});

		this.worker = new Worker(
			"expire-job-post",
			async (job) => await this.jobWorker.expireJobPost(job),
			{ connection }
		);

		this.worker.on("completed", (job) => {
			console.log(`✅ Job expired: ${job.id}`);
		});

		this.worker.on("failed", (job, err) => {
			console.error(`❌ Job failed: ${job?.id}`, err);
		});

		console.log("Expire job worker started");
	}
}
