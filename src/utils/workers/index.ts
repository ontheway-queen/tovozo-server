import { Worker } from "bullmq";
import Redis from "ioredis";
import JobPostWorker from "./job/jobPostWorker";

export default class Workers {
	constructor(redisUrl = "redis://localhost") {
		this.redisUrl = redisUrl;
		this.connection = new Redis(this.redisUrl, {
			maxRetriesPerRequest: null,
		});
		this.callWorkers();
	}

	private worker: Worker | null = null;
	private redisUrl: string;
	private connection: Redis;
	private jobPostWorker = new JobPostWorker();

	private callWorkers() {
		this.ExpireJobPostDetails();
		this.jobStartReminder();
	}

	public ExpireJobPostDetails() {
		this.worker = new Worker(
			"expire-job-post-details",
			async (job) => await this.jobPostWorker.expireJobPostDetails(job),
			{ connection: this.connection }
		);

		this.worker.on("completed", (job) => {
			console.log(`✅ Job post details expired: ${job.id}`);
		});

		this.worker.on("failed", (job, err) => {
			console.error(
				`❌ Job post details expired failed: ${job?.id}`,
				err
			);
		});
	}

	public jobStartReminder() {
		this.worker = new Worker(
			"jobStartReminder",
			async (job) => await this.jobPostWorker.jobStartReminder(job),
			{ connection: this.connection }
		);

		this.worker.on("completed", (job) => {
			console.log(
				`✅ Job start reminder sent successfully for jobPostDetail ID: ${job.data.id}`
			);
		});

		this.worker.on("failed", (job, err) => {
			console.error(
				`❌ Failed to send job start reminder for jobPostDetail ID: ${job?.data?.id}`,
				err
			);
		});
	}
}
