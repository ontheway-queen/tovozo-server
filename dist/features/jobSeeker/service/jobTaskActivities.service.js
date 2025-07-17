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
const userModelTypes_1 = require("../../../utils/modelTypes/user/userModelTypes");
const commonModelTypes_1 = require("../../../utils/modelTypes/common/commonModelTypes");
class JobTaskActivitiesService extends abstract_service_1.default {
    constructor() {
        super();
        this.startJobTaskActivities = (req) => __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.jobSeeker;
            const { job_application_id, job_post_details_id } = req.body;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
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
                const exitingTaskActivities = yield jobTaskActivitiesModel.getSingleTaskActivity({
                    job_post_details_id,
                });
                if (exitingTaskActivities) {
                    throw new customError_1.default(`A task activity already exists for this job.`, this.StatusCode.HTTP_CONFLICT);
                }
                const payload = {
                    job_application_id,
                    job_post_details_id,
                };
                const res = yield jobTaskActivitiesModel.createJobTaskActivity(payload);
                // await jobApplicationModel.updateMyJobApplicationStatus(
                // 	job_application_id,
                // 	user_id,
                // 	JOB_APPLICATION_STATUS.IN_PROGRESS
                // );
                // await jobPostModel.updateJobPostDetailsStatus(
                // 	myApplication.job_post_details_id,
                // 	JOB_POST_DETAILS_STATUS.In_Progress
                // );
                const onlineUsers = (0, socket_1.getAllOnlineSocketIds)({
                    user_id,
                    type: constants_1.USER_TYPE.JOB_SEEKER,
                });
                yield this.insertNotification(trx, userModelTypes_1.TypeUser.HOTELIER, {
                    user_id: myApplication.hotelier_id,
                    content: `New tasks have been assigned to you.`,
                    related_id: res[0].id,
                    type: commonModelTypes_1.NotificationTypeEnum.JOB_TASK,
                });
                socket_1.io.emit("start-job-task", {
                    id: res[0].id,
                    start_time: new Date(),
                    end_time: null,
                    total_working_hours: null,
                    start_approved_at: null,
                    end_approved_at: null,
                });
                return {
                    success: true,
                    message: this.ResMsg.HTTP_OK,
                    code: this.StatusCode.HTTP_OK,
                };
            }));
        });
        this.toggleTaskCompletionStatus = (req) => __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const is_completed = req.query.is_completed;
            const isCompleted = is_completed === "1" ? true : false;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const jobTaskListModel = this.Model.jobTaskListModel(trx);
                const taskList = yield jobTaskListModel.getJobTaskList({ id });
                if (!taskList.length) {
                    throw new customError_1.default("Job task not found. Please create task to proceed.", this.StatusCode.HTTP_NOT_FOUND);
                }
                if (taskList[0].is_completed === isCompleted) {
                    throw new customError_1.default(`Task is already marked as ${isCompleted ? "completed" : "incomplete"}`, this.StatusCode.HTTP_BAD_REQUEST);
                }
                const payload = {
                    is_completed: isCompleted,
                    completed_at: isCompleted ? new Date().toISOString() : null,
                };
                yield jobTaskListModel.updateJobTaskList(id, payload);
                socket_1.io.emit("update:job-task-list", {
                    id,
                    message: taskList[0].message,
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
                const jobApplicationModel = this.Model.jobApplicationModel(trx);
                const jobTaskActivitiesModel = this.Model.jobTaskActivitiesModel(trx);
                const jobPostModel = this.Model.jobPostModel(trx);
                const jobTaskListModel = this.Model.jobTaskListModel(trx);
                const taskActivity = yield jobTaskActivitiesModel.getSingleTaskActivity({
                    id: Number(id),
                });
                if (!taskActivity) {
                    throw new customError_1.default("Task activity not found", this.StatusCode.HTTP_NOT_FOUND);
                }
                if (taskActivity.application_status !==
                    constants_1.JOB_APPLICATION_STATUS.IN_PROGRESS) {
                    throw new customError_1.default(`You cannot perform this action because the application is not in progress.`, this.StatusCode.HTTP_FORBIDDEN);
                }
                const taskList = yield jobTaskListModel.getJobTaskList({
                    job_task_activity_id: Number(id),
                });
                console.log({ taskList });
                const incompleteTasks = taskList.filter((task) => !task.is_completed);
                console.log({ incompleteTasks });
                if (incompleteTasks.length > 0) {
                    throw new customError_1.default("There are incomplete tasks that must be finished before proceeding.", this.StatusCode.HTTP_BAD_REQUEST);
                }
                const myApplication = yield jobApplicationModel.getMyJobApplication({
                    job_application_id: taskActivity.job_application_id,
                    job_seeker_id: taskActivity.job_seeker_id,
                });
                console.log({ myApplication });
                if (!myApplication) {
                    throw new customError_1.default(`Job application not found or does not belong to you.`, this.StatusCode.HTTP_NOT_FOUND);
                }
                yield jobTaskActivitiesModel.updateJobTaskActivity(taskActivity.id, {
                    end_time: new Date(),
                });
                socket_1.io.emit("end-job-task", {
                    id,
                    start_time: taskActivity.start_time,
                    start_approved_at: taskActivity.start_approved_at,
                    end_time: new Date(),
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
