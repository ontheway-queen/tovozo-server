import { Worker } from "bullmq";
import Redis from "ioredis";
import JobPostWorker from "./job/jobPostWorker";
import ChatWorker from "./chat/chatWorker";

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
	private chatWorker = new ChatWorker();

	private callWorkers() {
		this.ExpireJobPostDetails();
		this.jobStartReminder();
		this.chatSessionCreator();
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

	public chatSessionCreator() {
		this.worker = new Worker(
			"chatSessionCreator",
			async (job) => await this.chatWorker.createChatSession(job),
			{ connection: this.connection }
		);

		this.worker.on("completed", (job) => {
			console.log(
				`✅ Chat session created successfully for jobseeker and hotelier.`
			);
		});

		this.worker.on("failed", (job, err) => {
			console.error(`❌ Failed to create chat session.`, err);
		});
	}
}
