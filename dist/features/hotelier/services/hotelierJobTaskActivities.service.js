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
const socket_1 = require("../../../app/socket");
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const commonModelTypes_1 = require("../../../utils/modelTypes/common/commonModelTypes");
const userModelTypes_1 = require("../../../utils/modelTypes/user/userModelTypes");
class HotelierJobTaskActivitiesService extends abstract_service_1.default {
    constructor() {
        super();
        this.approveJobTaskActivity = (req) => __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const jobApplicationModel = this.Model.jobApplicationModel(trx);
                const jobTaskActivitiesModel = this.Model.jobTaskActivitiesModel(trx);
                const taskActivity = yield jobTaskActivitiesModel.getSingleTaskActivity({
                    id: Number(id),
                });
                if (taskActivity.application_status !== constants_1.JOB_APPLICATION_STATUS.ENDED) {
                    throw new customError_1.default(`You cannot perform this action because the application is not ended yet.`, this.StatusCode.HTTP_FORBIDDEN);
                }
                const application = yield jobApplicationModel.getMyJobApplication({
                    job_application_id: taskActivity.job_application_id,
                    job_seeker_id: taskActivity.job_seeker_id,
                });
                if (!application) {
                    throw new customError_1.default(`Job application not found or does not belong to you.`, this.StatusCode.HTTP_NOT_FOUND);
                }
                yield jobApplicationModel.updateMyJobApplicationStatus(taskActivity.job_application_id, taskActivity.job_seeker_id, constants_1.JOB_APPLICATION_STATUS.COMPLETED);
                yield jobTaskActivitiesModel.updateJobTaskActivity(taskActivity.id, {
                    approved_at: new Date().toISOString(),
                });
                return {
                    success: true,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                };
            }));
        });
        this.createJobTaskList = (req) => __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const jobTaskActivitiesModel = this.Model.jobTaskActivitiesModel(trx);
                const jobTaskListModel = this.Model.jobTaskListModel(trx);
                const { user_id } = req.hotelier;
                const taskActivity = yield jobTaskActivitiesModel.getSingleTaskActivity({
                    id: body.job_task_activity_id,
                    hotelier_id: user_id,
                });
                if (!taskActivity) {
                    throw new customError_1.default("Task activity not found", this.StatusCode.HTTP_NOT_FOUND);
                }
                const res = yield jobTaskListModel.createJobTaskList(body);
                if (!res.length) {
                    throw new customError_1.default("Failed to create job task list", this.StatusCode.HTTP_BAD_REQUEST);
                }
                this.insertNotification(trx, userModelTypes_1.TypeUser.JOB_SEEKER, {
                    user_id: taskActivity.job_seeker_id,
                    content: `A new task has been created for you.`,
                    related_id: taskActivity.job_application_id,
                    type: commonModelTypes_1.NotificationTypeEnum.JOB_TASK,
                });
                socket_1.io.emit("create:job-task-list", {
                    id: res[0].id,
                    job_task_activity_id: body.job_task_activity_id,
                    message: body.message,
                    is_completed: false,
                    completed_at: null,
                    created_at: new Date().toISOString(),
                    job_seeker_id: taskActivity.job_seeker_id,
                    job_seeker_name: taskActivity.job_seeker_name,
                });
                return {
                    success: true,
                    message: this.ResMsg.HTTP_OK,
                    code: this.StatusCode.HTTP_OK,
                };
            }));
        });
        this.updateJobTaskList = (req) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const body = req.body;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const jobTaskListModel = this.Model.jobTaskListModel(trx);
                const taskList = yield jobTaskListModel.getJobTaskList({ id });
                if (!taskList.length) {
                    throw new customError_1.default("Job task list not found", this.StatusCode.HTTP_NOT_FOUND);
                }
                const payload = {
                    message: body.message,
                };
                yield jobTaskListModel.updateJobTaskList(id, payload);
                socket_1.io.emit("update:job-task-list", {
                    id,
                    message: body.message,
                });
                return {
                    success: true,
                    message: this.ResMsg.HTTP_OK,
                    code: this.StatusCode.HTTP_OK,
                };
            }));
        });
        this.deleteJobTaskList = (req) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const jobTaskListModel = this.Model.jobTaskListModel(trx);
                const taskList = yield jobTaskListModel.getJobTaskList({ id });
                if (!taskList.length) {
                    throw new customError_1.default("Job task list not found", this.StatusCode.HTTP_NOT_FOUND);
                }
                yield jobTaskListModel.deleteJobTaskList(id);
                socket_1.io.emit("delete:job-task-list", id);
                return {
                    success: true,
                    message: this.ResMsg.HTTP_OK,
                    code: this.StatusCode.HTTP_OK,
                };
            }));
        });
    }
}
exports.default = HotelierJobTaskActivitiesService;
