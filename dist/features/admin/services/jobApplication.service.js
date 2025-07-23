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
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
const constants_1 = require("../../../utils/miscellaneous/constants");
class AdminJobApplicationService extends abstract_service_1.default {
    constructor() {
        super();
    }
    assignJobApplication(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id: admin_id } = req.admin;
                const { job_post_details_id, user_id, job_post_id } = req.body;
                const model = this.Model.jobApplicationModel(trx);
                const jobPostModel = this.Model.jobPostModel(trx);
                const cancellationReportModel = this.Model.cancellationLogModel(trx);
                const jobPost = yield jobPostModel.getSingleJobPostForJobSeeker(job_post_details_id);
                if (!jobPost) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                }
                if (jobPost.status !== constants_1.JOB_POST_DETAILS_STATUS.Pending) {
                    throw new customError_1.default("Can't apply. This job post is not accepting applications.", this.StatusCode.HTTP_BAD_REQUEST);
                }
                const jobPostReport = yield cancellationReportModel.getSingleJobPostCancellationLog(null, constants_1.CANCELLATION_REPORT_TYPE.CANCEL_JOB_POST, job_post_details_id);
                if (jobPostReport &&
                    jobPostReport.status === constants_1.CANCELLATION_REPORT_STATUS.PENDING) {
                    throw new customError_1.default("A cancellation request is already pending for this job post.", this.StatusCode.HTTP_CONFLICT);
                }
                console.log({ jobPost });
                const res = yield model.createJobApplication({
                    job_seeker_id: user_id,
                    job_post_id: job_post_id,
                    job_post_details_id,
                });
                yield model.markJobPostDetailAsApplied(Number(job_post_details_id));
                yield this.insertAdminAudit(trx, {
                    details: `Job post ID:${job_post_details_id} assigned to a job seeker ID:${user_id} for further activities.`,
                    created_by: admin_id,
                    endpoint: req.originalUrl,
                    type: "UPDATE",
                    payload: JSON.stringify({
                        job_seeker_id: user_id,
                        job_post_id: job_post_id,
                        job_post_details_id,
                    }),
                });
                return {
                    success: true,
                    message: this.ResMsg.HTTP_OK,
                    code: this.StatusCode.HTTP_OK,
                    data: res[0].id,
                };
            }));
        });
    }
}
exports.default = AdminJobApplicationService;
