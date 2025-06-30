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
class HotelierJobPostService extends abstract_service_1.default {
    createJobPost(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.hotelier;
            const body = req.body;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.jobPostModel(trx);
                const organizationModel = this.Model.organizationModel(trx);
                const jobModel = this.Model.jobModel(trx);
                const checkOrganization = yield organizationModel.getOrganization({
                    user_id,
                });
                if (!checkOrganization) {
                    throw new customError_1.default("Organization not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                body.job_post.organization_id = checkOrganization.id;
                const res = yield model.createJobPost(body.job_post);
                if (!res.length) {
                    throw new customError_1.default(this.ResMsg.HTTP_BAD_REQUEST, this.StatusCode.HTTP_BAD_REQUEST);
                }
                const jobPostDetails = [];
                for (const detail of body.job_post_details) {
                    const checkJob = yield jobModel.getSingleJob(detail.job_id);
                    if (!checkJob) {
                        throw new customError_1.default("Invalid Job Category!", this.StatusCode.HTTP_BAD_REQUEST);
                    }
                    if (new Date(detail.start_time) >= new Date(detail.end_time)) {
                        throw new customError_1.default("Job post start time cannot be greater than or equal to end time.", this.StatusCode.HTTP_BAD_REQUEST);
                    }
                    jobPostDetails.push(Object.assign(Object.assign({}, detail), { job_post_id: res[0].id }));
                }
                yield model.createJobPostDetails(jobPostDetails);
                return {
                    success: true,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
    getJobPostList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, status } = req.query;
            const { user_id } = req.hotelier;
            const model = this.Model.jobPostModel();
            const data = yield model.getHotelierJobPostList({
                user_id,
                limit,
                skip,
                status,
            });
            return Object.assign({ success: true, message: this.ResMsg.HTTP_OK, code: this.StatusCode.HTTP_OK }, data);
        });
    }
    getSingleJobPostWithJobSeekerDetails(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const model = this.Model.jobPostModel();
            const data = yield model.getSingleJobPostWithJobSeekerDetails(Number(id));
            if (!data) {
                throw new customError_1.default("Job post not found!", this.StatusCode.HTTP_NOT_FOUND);
            }
            return {
                success: true,
                message: this.ResMsg.HTTP_OK,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    updateJobPost(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const body = req.body;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.jobPostModel(trx);
                const jobPost = yield model.getSingleJobPostWithJobSeekerDetails(Number(id));
                if (!jobPost) {
                    throw new customError_1.default("Job post not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                if (jobPost.job_post_details_status !==
                    constants_1.JOB_POST_DETAILS_STATUS.Pending) {
                    throw new customError_1.default("The job post cannot be updated because its status is not 'Pending'.", this.StatusCode.HTTP_BAD_REQUEST);
                }
                const hasJobPost = body.job_post && Object.keys(body.job_post).length > 0;
                const hasJobPostDetails = body.job_post_details &&
                    Object.keys(body.job_post_details).length > 0;
                if (hasJobPost) {
                    yield model.updateJobPost(Number(jobPost.job_post_id), body.job_post);
                }
                if (hasJobPostDetails) {
                    const { start_time, end_time } = body.job_post_details;
                    if (start_time &&
                        end_time &&
                        new Date(start_time) >= new Date(end_time)) {
                        throw new customError_1.default("Job post start time cannot be greater than or equal to end time.", this.StatusCode.HTTP_BAD_REQUEST);
                    }
                    yield model.updateJobPostDetails(Number(id), body.job_post_details);
                }
                if (!hasJobPost && !hasJobPostDetails) {
                    throw new customError_1.default("No values provided to update.", this.StatusCode.HTTP_BAD_REQUEST);
                }
                return {
                    success: true,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    code: this.StatusCode.HTTP_OK,
                };
            }));
        });
    }
    cancelJobPost(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const body = req.body;
                const user = req.hotelier;
                const model = this.Model.jobPostModel(trx);
                const cancellationReportModel = this.Model.cancellationReportModel(trx);
                const jobPost = yield model.getSingleJobPost(Number(id));
                if (!jobPost) {
                    throw new customError_1.default("Job post not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                if (jobPost.status ===
                    constants_1.JOB_POST_DETAILS_STATUS.Cancelled) {
                    throw new customError_1.default("Job post already cancelled", this.StatusCode.HTTP_BAD_REQUEST);
                }
                const report = yield cancellationReportModel.getSingleReportWithRelatedId(jobPost.id);
                if (report) {
                    throw new customError_1.default(this.ResMsg.HTTP_CONFLICT, this.StatusCode.HTTP_CONFLICT);
                }
                const currentTime = new Date();
                const startTime = new Date(jobPost.start_time);
                const hoursDiff = (startTime.getTime() - currentTime.getTime()) /
                    (1000 * 60 * 60);
                if (hoursDiff > 24) {
                    yield model.cancelJobPost(Number(jobPost.job_post_id));
                    yield model.updateJobPostDetailsStatus(Number(jobPost.job_post_id), constants_1.JOB_POST_DETAILS_STATUS.Cancelled);
                    const jobApplicationModel = this.Model.jobApplicationModel(trx);
                    yield jobApplicationModel.cancelApplication(jobPost.job_post_id);
                    return {
                        success: true,
                        message: "Your job post has been successfully cancelled.",
                        code: this.StatusCode.HTTP_OK,
                    };
                }
                else {
                    if (body.report_type !==
                        constants_1.CANCELLATION_REPORT_TYPE.CANCEL_JOB_POST ||
                        !body.reason) {
                        throw new customError_1.default("Invalid request: 'report_type' and 'reason' is required.", this.StatusCode.HTTP_UNPROCESSABLE_ENTITY);
                    }
                    body.reporter_id = user.user_id;
                    body.related_id = id;
                    const cancellationReportModel = this.Model.cancellationReportModel(trx);
                    const data = yield cancellationReportModel.requestForCancellationReport(body);
                    return {
                        success: true,
                        message: this.ResMsg.HTTP_SUCCESSFUL,
                        code: this.StatusCode.HTTP_OK,
                        data: data[0].id,
                    };
                }
            }));
        });
    }
}
exports.default = HotelierJobPostService;
