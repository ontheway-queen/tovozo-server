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
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const jobPostWorker_1 = __importDefault(require("./job/jobPostWorker"));
class Workers {
    constructor(redisUrl = "redis://localhost") {
        this.worker = null;
        this.jobPostWorker = new jobPostWorker_1.default();
        this.redisUrl = redisUrl;
        this.connection = new ioredis_1.default(this.redisUrl, {
            maxRetriesPerRequest: null,
        });
        this.callWorkers();
    }
    callWorkers() {
        this.ExpireJobPostDetails();
    }
    ExpireJobPostDetails() {
        if (this.worker)
            return;
        this.worker = new bullmq_1.Worker("expire-job-post-details", (job) => __awaiter(this, void 0, void 0, function* () { return yield this.jobPostWorker.expireJobPostDetails(job); }), { connection: this.connection });
        this.worker.on("completed", (job) => {
            console.log(`✅ Job post details expired: ${job.id}`);
        });
        this.worker.on("failed", (job, err) => {
            console.error(`❌ Job post details expired failed: ${job === null || job === void 0 ? void 0 : job.id}`, err);
        });
    }
}
exports.default = Workers;
