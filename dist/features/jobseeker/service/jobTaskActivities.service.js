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
const dayjs_1 = __importDefault(require("dayjs"));
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const socket_1 = require("../../../app/socket");
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
const constants_1 = require("../../../utils/miscellaneous/constants");
class JobTaskActivitiesService extends abstract_service_1.default {
    constructor() {
        super();
        this.startJobTaskActivities = (req) => __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.jobSeeker;
            const { job_application_id, job_post_details_id } = req.body;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const jobPostModel = this.Model.jobPostModel(trx);
                const jobApplicationModel = this.Model.jobApplicationModel(trx);
                const jobTaskActivitiesModel = this.Model.jobTaskActivitiesModel(trx);
                const myApplication = yield jobApplicationModel.getMyJobApplication({
                    job_application_id,
                    job_seeker_id: user_id,
                });
                if (myApplication.job_application_status !== constants_1.JOB_APPLICATION_STATUS.PENDING) {
                    throw new customError_1.default(`Job application must be in 'PENDING' status to perform this action.`, this.StatusCode.HTTP_BAD_REQUEST);
                }
                const startTime = new Date(myApplication.start_time);
                const now = new Date();
                if (now < startTime) {
                    throw new customError_1.default(`You cannot start the task before the scheduled start time.`, this.StatusCode.HTTP_FORBIDDEN);
                }
                const exitingTaskActivities = yield jobTaskActivitiesModel.getSingleTaskActivity(null, job_post_details_id);
                if (exitingTaskActivities) {
                    throw new customError_1.default(`A task activity already exists for this job.`, this.StatusCode.HTTP_CONFLICT);
                }
                const payload = {
                    job_application_id,
                    job_post_details_id,
                    start_time: now,
                };
                const res = yield jobTaskActivitiesModel.createJobTaskActivity(payload);
                yield jobApplicationModel.updateMyJobApplicationStatus(job_application_id, user_id, constants_1.JOB_APPLICATION_STATUS.IN_PROGRESS);
                yield jobPostModel.updateJobPostDetailsStatus(myApplication.job_post_details_id, constants_1.JOB_POST_DETAILS_STATUS.In_Progress);
                socket_1.io.emit("start-job-task", {
                    id: res[0].id,
                    start_time: new Date(),
                    end_time: null,
                    total_working_hours: null,
                    approved_at: null,
                });
                return {
                    success: true,
                    message: this.ResMsg.HTTP_OK,
                    code: this.StatusCode.HTTP_OK,
                };
            }));
        });
        this.endJobTaskActivities = (req) => __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { user_id } = req.jobSeeker;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const jobApplicationModel = this.Model.jobApplicationModel(trx);
                const jobTaskActivitiesModel = this.Model.jobTaskActivitiesModel(trx);
                const jobPostModel = this.Model.jobPostModel(trx);
                const taskActivity = yield jobTaskActivitiesModel.getSingleTaskActivity(Number(id), null);
                if (!taskActivity) {
                    throw new customError_1.default("Task activity not found", this.StatusCode.HTTP_NOT_FOUND);
                }
                if (taskActivity.application_status !== constants_1.JOB_APPLICATION_STATUS.IN_PROGRESS) {
                    throw new customError_1.default(`You cannot perform this action because the application is not in progress.`, this.StatusCode.HTTP_FORBIDDEN);
                }
                const myApplication = yield jobApplicationModel.getMyJobApplication({
                    job_application_id: taskActivity.job_application_id,
                    job_seeker_id: taskActivity.job_seeker_id,
                });
                if (!myApplication) {
                    throw new customError_1.default(`Job application not found or does not belong to you.`, this.StatusCode.HTTP_NOT_FOUND);
                }
                const startTime = (0, dayjs_1.default)(taskActivity.start_time).valueOf();
                const endTime = (0, dayjs_1.default)((_a = taskActivity.end_time) !== null && _a !== void 0 ? _a : new Date()).valueOf();
                const totalWorkingHours = Number(((endTime - startTime) / (1000 * 60 * 60)).toFixed(2));
                yield jobApplicationModel.updateMyJobApplicationStatus(taskActivity.job_application_id, user_id, constants_1.JOB_APPLICATION_STATUS.ENDED);
                yield jobTaskActivitiesModel.updateJobTaskActivity(taskActivity.id, {
                    end_time: new Date(),
                    total_working_hours: totalWorkingHours,
                });
                yield jobPostModel.updateJobPostDetailsStatus(myApplication.job_post_details_id, constants_1.JOB_POST_DETAILS_STATUS.WorkFinished);
                socket_1.io.emit("end-job-task", {
                    id,
                    start_time: taskActivity.start_time,
                    end_time: new Date(),
                    total_working_hours: totalWorkingHours,
                    approved_at: null,
                });
                return {
                    success: true,
                    message: this.ResMsg.HTTP_OK,
                    code: this.StatusCode.HTTP_OK,
                };
            }));
        });
    }
}
exports.default = JobTaskActivitiesService;
