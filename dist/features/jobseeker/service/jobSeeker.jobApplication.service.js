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
exports.JobSeekerJobApplication = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
const jobPostModel_1 = __importDefault(require("../../../models/hotelierModel/jobPostModel"));
const constants_1 = require("../../../utils/miscellaneous/constants");
class JobSeekerJobApplication extends abstract_service_1.default {
    constructor() {
        super();
        this.createJobApplication = (req) => __awaiter(this, void 0, void 0, function* () {
            const { job_post_details_id } = req.body;
            const { user_id } = req.jobSeeker;
            const payload = {
                job_post_details_id: Number(job_post_details_id),
                job_seeker_id: user_id,
            };
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const jobPostModel = new jobPostModel_1.default(trx);
                const jobPost = yield jobPostModel.getSingleJobPos(payload.job_post_details_id);
                if (!jobPost) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                }
                if (jobPost.status !== constants_1.JOB_POST_DETAILS_STATUS.Pending) {
                    throw new customError_1.default("This job post is no longer accepting applications.", this.StatusCode.HTTP_BAD_REQUEST);
                }
                const model = this.Model.jobApplicationModel(trx);
                const res = yield model.createJobApplication(payload);
                yield model.markJobPostDetailAsApplied(Number(job_post_details_id));
                return {
                    success: true,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    data: (_a = res[0]) === null || _a === void 0 ? void 0 : _a.id,
                };
            }));
        });
        this.getMyJobApplications = (req) => __awaiter(this, void 0, void 0, function* () {
            const { orderBy, orderTo, status, limit, skip } = req.query;
            const { user_id } = req.jobSeeker;
            const model = this.Model.jobApplicationModel();
            const { data, total } = yield model.getMyJobApplications({
                user_id,
                status: status,
                limit: limit ? Number(limit) : 100,
                skip: skip ? Number(skip) : 0,
                orderBy: orderBy,
                orderTo: orderTo,
            });
            return {
                success: true,
                message: this.ResMsg.HTTP_SUCCESSFUL,
                code: this.StatusCode.HTTP_OK,
                data,
                total,
            };
        });
        this.getMyJobApplication = (req) => __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { user_id } = req.jobSeeker;
            const model = this.Model.jobApplicationModel();
            const data = yield model.getMyJobApplication({
                job_application_id: parseInt(id),
                job_seeker_id: user_id,
            });
            if (!data) {
                throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
            }
            return {
                success: true,
                message: this.ResMsg.HTTP_SUCCESSFUL,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
}
exports.JobSeekerJobApplication = JobSeekerJobApplication;
