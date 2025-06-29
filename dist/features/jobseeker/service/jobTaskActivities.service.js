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
const constants_1 = require("../../../utils/miscellaneous/constants");
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
class JobTaskActivitiesService extends abstract_service_1.default {
    constructor() {
        super();
        this.startJobTaskActivities = (req) => __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.jobSeeker;
            const { job_application_id, job_post_details_id } = req.body;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const jobApplicationModel = this.Model.jobApplicationModel(trx);
                const jobTaskActivitiesModel = this.Model.jobTaskActivitiesModel(trx);
                const myApplication = yield jobApplicationModel.getMyJobApplication({
                    job_application_id,
                    job_seeker_id: user_id,
                });
                if (myApplication.job_application_status !==
                    constants_1.JOB_APPLICATION_STATUS.PENDING) {
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
                    start_time: new Date().toISOString(),
                };
                yield jobApplicationModel.updateMyJobApplicationStatus(job_application_id, user_id, constants_1.JOB_APPLICATION_STATUS.IN_PROGRESS);
                const res = yield jobTaskActivitiesModel.createJobTaskActivity(payload);
                return {
                    success: true,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    data: (_a = res[0]) === null || _a === void 0 ? void 0 : _a.id,
                };
            }));
        });
        this.endJobTaskActivities = (req) => __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { user_id } = req.jobSeeker;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const jobApplicationModel = this.Model.jobApplicationModel(trx);
                const jobTaskActivitiesModel = this.Model.jobTaskActivitiesModel(trx);
                const taskActivity = yield jobTaskActivitiesModel.getSingleTaskActivity(Number(id), null);
                if (taskActivity.application_status !==
                    constants_1.JOB_APPLICATION_STATUS.IN_PROGRESS) {
                    throw new customError_1.default(`You cannot perform this action because the application is not in progress.`, this.StatusCode.HTTP_FORBIDDEN);
                }
                const myApplication = yield jobApplicationModel.getMyJobApplication({
                    job_application_id: taskActivity.job_application_id,
                    job_seeker_id: taskActivity.job_seeker_id,
                });
                if (!myApplication) {
                    throw new customError_1.default(`Job application not found or does not belong to you.`, this.StatusCode.HTTP_NOT_FOUND);
                }
                yield jobApplicationModel.updateMyJobApplicationStatus(taskActivity.job_application_id, user_id, constants_1.JOB_APPLICATION_STATUS.ENDED);
                yield jobTaskActivitiesModel.updateJobTaskActivity(taskActivity.id, { end_time: new Date().toISOString() });
                return {
                    success: true,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
}
exports.default = JobTaskActivitiesService;
