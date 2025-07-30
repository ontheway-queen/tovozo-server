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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
                const applicationModel = this.Model.jobApplicationModel(trx);
                const jobPost = yield jobPostModel.getSingleJobPostForJobSeeker(job_post_details_id);
                if (!jobPost) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                }
                if (jobPost.status !== constants_1.JOB_POST_DETAILS_STATUS.Pending) {
                    throw new customError_1.default("Can't apply. This job post is not accepting applications.", this.StatusCode.HTTP_BAD_REQUEST);
                }
                const jobPostReport = yield cancellationReportModel.getSingleJobPostCancellationLog({
                    id: null,
                    report_type: constants_1.CANCELLATION_REPORT_TYPE.CANCEL_JOB_POST,
                    related_id: job_post_details_id,
                });
                if (jobPostReport &&
                    jobPostReport.status === constants_1.CANCELLATION_REPORT_STATUS.PENDING) {
                    throw new customError_1.default("A cancellation request is already pending for this job post.", this.StatusCode.HTTP_CONFLICT);
                }
                const application = yield applicationModel.getMyJobApplication({
                    job_seeker_id: user_id,
                });
                console.log({ application });
                if (application &&
                    application.job_application_status !==
                        constants_1.JOB_APPLICATION_STATUS.ENDED &&
                    (application.job_application_status !==
                        constants_1.JOB_APPLICATION_STATUS.COMPLETED &&
                        application.job_application_status) !==
                        constants_1.JOB_APPLICATION_STATUS.CANCELLED) {
                    throw new customError_1.default("Bad Request: This job seeker already has an ongoing or incomplete application. You can only assign again after the current application is marked as completed or ended.", this.StatusCode.HTTP_BAD_REQUEST);
                }
                const res = yield model.createJobApplication({
                    job_seeker_id: user_id,
                    job_post_id: job_post_id,
                    job_post_details_id,
                    created_by: admin_id,
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
                        created_by: admin_id,
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
    getAllAdminAssignedApplications(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, status, from_date, to_date, name } = req.query;
            const model = this.Model.jobApplicationModel();
            const _a = yield model.getAllAdminAssignedApplications({
                limit: Number(limit),
                skip: Number(skip),
                status: status,
                from_date: from_date,
                to_date: to_date,
                name: name,
            }), { total } = _a, data = __rest(_a, ["total"]);
            return Object.assign(Object.assign({ success: true, message: this.ResMsg.HTTP_OK, code: this.StatusCode.HTTP_OK }, data), { total });
        });
    }
}
exports.default = AdminJobApplicationService;
