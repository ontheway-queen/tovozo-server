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
class CancellationLogService extends abstract_service_1.default {
    // get reports
    getCancellationLogs(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const model = this.Model.cancellationLogModel();
            if (query.report_type !== constants_1.CANCELLATION_REPORT_TYPE.CANCEL_APPLICATION &&
                query.report_type !== constants_1.CANCELLATION_REPORT_TYPE.CANCEL_JOB_POST) {
                throw new customError_1.default("Report type is invalid. Please add report type in the query", this.StatusCode.HTTP_BAD_REQUEST);
            }
            let data;
            if (query.report_type === constants_1.CANCELLATION_REPORT_TYPE.CANCEL_JOB_POST) {
                data = yield model.getJobPostCancellationLogs(query);
            }
            else if (query.report_type === constants_1.CANCELLATION_REPORT_TYPE.CANCEL_APPLICATION) {
                data = yield model.getJobApplicationCancellationLogs(query);
            }
            return Object.assign({ success: true, code: this.StatusCode.HTTP_OK, message: this.ResMsg.HTTP_OK }, data);
        });
    }
    // get single report
    getSingleCancellationLog(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { report_type } = req.query;
            const model = this.Model.cancellationLogModel();
            let data;
            if (report_type === constants_1.CANCELLATION_REPORT_TYPE.CANCEL_APPLICATION) {
                data = yield model.getSingleJobApplicationCancellationLog(id, report_type);
            }
            else if (report_type === constants_1.CANCELLATION_REPORT_TYPE.CANCEL_JOB_POST) {
                data = yield model.getSingleJobPostCancellationLog(id, report_type);
            }
            if (!data) {
                throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
            };
        });
    }
    // update cancellation report statu
    updateCancellationLogStatus(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id } = req.admin;
                const body = req.body;
                const id = req.params.id;
                const { report_type } = req.query;
                const reportModel = this.Model.cancellationLogModel(trx);
                const jobPostModel = this.Model.jobPostModel(trx);
                const jobApplicationModel = this.Model.jobApplicationModel(trx);
                let report;
                if (report_type === constants_1.CANCELLATION_REPORT_TYPE.CANCEL_JOB_POST) {
                    report = yield reportModel.getSingleJobPostCancellationLog(Number(id), report_type);
                    console.log({ report });
                }
                else if (report_type === constants_1.CANCELLATION_REPORT_TYPE.CANCEL_APPLICATION) {
                    report =
                        yield reportModel.getSingleJobApplicationCancellationLog(Number(id), report_type);
                }
                if (!report) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                }
                console.log({ report });
                if (report.status !== constants_1.CANCELLATION_REPORT_STATUS.PENDING) {
                    throw new customError_1.default(`${report.status} status can't be ${body.status} again`, this.StatusCode.HTTP_BAD_REQUEST);
                }
                body.reviewed_by = user_id;
                body.reviewed_at = new Date().toISOString();
                body.reject_reason =
                    body.status === constants_1.CANCELLATION_REPORT_STATUS.REJECTED
                        ? body.reject_reason
                        : null;
                if (body.status === constants_1.CANCELLATION_REPORT_STATUS.APPROVED) {
                    yield reportModel.updateCancellationLogStatus(Number(id), body);
                    if (report_type === constants_1.CANCELLATION_REPORT_TYPE.CANCEL_JOB_POST) {
                        const jobPost = yield jobPostModel.getSingleJobPostForHotelier(report.related_job_post_details);
                        console.log({ jobPost });
                        yield jobPostModel.cancelJobPost(Number(jobPost.job_post_id));
                        yield jobPostModel.updateJobPostDetailsStatus(Number(jobPost.id), constants_1.JOB_POST_DETAILS_STATUS.Cancelled);
                        yield jobApplicationModel.cancelApplication(Number(jobPost.job_post_id));
                    }
                    else if (report_type === constants_1.CANCELLATION_REPORT_TYPE.CANCEL_APPLICATION) {
                        const application = yield jobApplicationModel.updateMyJobApplicationStatus(report.related_id, report.reporter_id, constants_1.JOB_APPLICATION_STATUS.CANCELLED);
                        yield jobPostModel.updateJobPostDetailsStatus(application.job_post_details_id, constants_1.JOB_POST_DETAILS_STATUS.Pending);
                    }
                }
                else {
                    yield reportModel.updateCancellationLogStatus(Number(id), body);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
}
exports.default = CancellationLogService;
