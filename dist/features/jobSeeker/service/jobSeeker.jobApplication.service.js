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
const cancellationLogModel_1 = __importDefault(require("../../../models/cancellationLogModel/cancellationLogModel"));
const jobPostModel_1 = __importDefault(require("../../../models/hotelierModel/jobPostModel"));
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
const constants_1 = require("../../../utils/miscellaneous/constants");
class JobSeekerJobApplication extends abstract_service_1.default {
    constructor() {
        super();
        this.createJobApplication = (req) => __awaiter(this, void 0, void 0, function* () {
            const { job_post_details_id } = req.body;
            const { user_id, gender } = req.jobSeeker;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const jobPostModel = new jobPostModel_1.default(trx);
                const cancellationLogModel = new cancellationLogModel_1.default(trx);
                const jobPost = yield jobPostModel.getSingleJobPost(job_post_details_id);
                if (!jobPost) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                }
                if (jobPost.status !==
                    constants_1.JOB_POST_DETAILS_STATUS.Pending) {
                    throw new customError_1.default("This job post is no longer accepting applications.", this.StatusCode.HTTP_BAD_REQUEST);
                }
                const jobPostReport = yield cancellationLogModel.getSingleJobPostCancellationLog(null, constants_1.CANCELLATION_REPORT_TYPE.CANCEL_JOB_POST, job_post_details_id);
                if (jobPostReport &&
                    jobPostReport.status === constants_1.CANCELLATION_REPORT_STATUS.PENDING) {
                    throw new customError_1.default("A cancellation request is already pending for this job post.", this.StatusCode.HTTP_CONFLICT);
                }
                if (jobPost.gender !== constants_1.GENDER_TYPE.Other &&
                    gender &&
                    gender !== constants_1.GENDER_TYPE.Other &&
                    gender !== jobPost.gender) {
                    throw new customError_1.default("Your gender does not meet the eligibility criteria for this job.", this.StatusCode.HTTP_BAD_REQUEST);
                }
                const model = this.Model.jobApplicationModel(trx);
                const existPendingApplication = yield model.getMyJobApplication({
                    job_seeker_id: user_id,
                });
                // if (
                // 	existPendingApplication &&
                // 	(existPendingApplication.job_application_status ===
                // 		JOB_APPLICATION_STATUS.PENDING ||
                // 		existPendingApplication.job_application_status ===
                // 			JOB_APPLICATION_STATUS.IN_PROGRESS)
                // ) {
                // 	throw new CustomError(
                // 		"Hold on! You need to complete your current job before moving on to the next.",
                // 		this.StatusCode.HTTP_BAD_REQUEST
                // 	);
                // }
                const payload = {
                    job_post_details_id: Number(job_post_details_id),
                    job_seeker_id: user_id,
                    job_post_id: jobPost.job_post_id,
                };
                yield model.createJobApplication(payload);
                yield model.markJobPostDetailAsApplied(Number(job_post_details_id));
                return {
                    success: true,
                    message: this.ResMsg.HTTP_OK,
                    code: this.StatusCode.HTTP_OK,
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
                message: this.ResMsg.HTTP_OK,
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
                throw new customError_1.default(`The job application with ID ${id} was not found.`, this.StatusCode.HTTP_NOT_FOUND);
            }
            return {
                success: true,
                message: this.ResMsg.HTTP_OK,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
        this.cancelMyJobApplication = (req) => __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const id = req.params.id;
                const { user_id } = req.jobSeeker;
                const body = req.body;
                const applicationModel = this.Model.jobApplicationModel(trx);
                const jobPostModel = this.Model.jobPostModel(trx);
                const application = yield applicationModel.getMyJobApplication({
                    job_application_id: Number(id),
                    job_seeker_id: Number(user_id),
                });
                if (!application) {
                    throw new customError_1.default("Application not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                if (application.job_application_status !== constants_1.JOB_APPLICATION_STATUS.PENDING) {
                    throw new customError_1.default("This application cannot be cancelled because it has already been processed.", this.StatusCode.HTTP_BAD_REQUEST);
                }
                const cancellationLogModel = this.Model.cancellationLogModel(trx);
                const isReportExists = yield cancellationLogModel.getSingleCancellationLogWithRelatedId(Number(id));
                if (isReportExists) {
                    throw new customError_1.default("A cancellation report for this application is already pending.", this.StatusCode.HTTP_BAD_REQUEST);
                }
                const currentTime = new Date();
                const startTime = new Date(application === null || application === void 0 ? void 0 : application.start_time);
                const hoursDiff = (startTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
                if (hoursDiff > 24) {
                    const data = yield applicationModel.updateMyJobApplicationStatus(parseInt(id), user_id, constants_1.JOB_APPLICATION_STATUS.CANCELLED);
                    if (!data) {
                        throw new customError_1.default("Application data with the requested id not found", this.StatusCode.HTTP_NOT_FOUND);
                    }
                    yield jobPostModel.updateJobPostDetailsStatus(data.job_post_id, constants_1.JOB_POST_DETAILS_STATUS.Pending);
                    return {
                        success: true,
                        message: this.ResMsg.HTTP_OK,
                        code: this.StatusCode.HTTP_OK,
                    };
                }
                else {
                    if (body.report_type !== constants_1.CANCELLATION_REPORT_TYPE.CANCEL_APPLICATION ||
                        !body.reason) {
                        throw new customError_1.default(this.ResMsg.HTTP_UNPROCESSABLE_ENTITY, this.StatusCode.HTTP_UNPROCESSABLE_ENTITY);
                    }
                    body.reporter_id = user_id;
                    body.related_id = id;
                    const cancellationReportModel = this.Model.cancellationLogModel(trx);
                    yield cancellationReportModel.requestForCancellationLog(body);
                    return {
                        success: true,
                        message: this.ResMsg.HTTP_OK,
                        code: this.StatusCode.HTTP_OK,
                    };
                }
            }));
        });
    }
}
exports.JobSeekerJobApplication = JobSeekerJobApplication;
