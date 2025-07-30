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
const database_1 = require("../../../app/database");
const rootModel_1 = __importDefault(require("../../../models/rootModel"));
const constants_1 = require("../../miscellaneous/constants");
class JobPostWorker {
    expireJobPost(job) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = job.data;
            return yield database_1.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const jobPostModel = new rootModel_1.default().jobPostModel(trx);
                const jobPost = yield jobPostModel.updateJobPost(id, {
                    status: constants_1.JOB_POST_STATUS.Expired,
                });
                const jobs = yield jobPostModel.getAllJobsUsingJobPostId(id);
                if (jobs.length > 0) {
                    yield Promise.all(jobs.map((job) => jobPostModel.updateJobPostDetailsStatus({
                        id: job.id,
                        status: constants_1.JOB_POST_DETAILS_STATUS.Expired,
                    })));
                }
            }));
        });
    }
}
exports.default = JobPostWorker;
