"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// JobPostExpireWorker.ts - manages the worker side only
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const jobPostWorker_1 = __importDefault(require("./jobPost/jobPostWorker"));
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
class Workers {
    constructor(redisUrl = "redis://localhost") {
        this.worker = null;
        this.jobWorker = new jobPostWorker_1.default();
        this.redisUrl = redisUrl;
        this.callWorkers();
    }
    callWorkers() {
        this.ExpireJob();
    }
    ExpireJob() {
        if (this.worker)
            return;
        const connection = new ioredis_1.default(this.redisUrl, {
            maxRetriesPerRequest: null,
        });
        this.worker = new bullmq_1.Worker("expire-job-post", (job) => __awaiter(this, void 0, void 0, function* () { return yield this.jobWorker.expireJobPost(job); }), { connection });
        this.worker.on("completed", (job) => {
            console.log(`✅ Job expired: ${job.id}`);
        });
        this.worker.on("failed", (job, err) => {
            console.error(`❌ Job failed: ${job === null || job === void 0 ? void 0 : job.id}`, err);
        });
        console.log("Expire job worker started");
    }
}
exports.default = Workers;
