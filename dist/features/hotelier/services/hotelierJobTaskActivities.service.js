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
const commonModelTypes_1 = require("../../../utils/modelTypes/common/commonModelTypes");
const userModelTypes_1 = require("../../../utils/modelTypes/user/userModelTypes");
class HotelierJobTaskActivitiesService extends abstract_service_1.default {
    constructor() {
        super();
        this.approveJobTaskActivity = (req) => __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const jobPostModel = this.Model.jobPostModel(trx);
                const jobApplicationModel = this.Model.jobApplicationModel(trx);
                const jobTaskActivitiesModel = this.Model.jobTaskActivitiesModel(trx);
                const taskActivity = yield jobTaskActivitiesModel.getSingleTaskActivity({
                    id: Number(id),
                });
                console.log({ taskActivity });
                if (taskActivity.application_status !==
                    constants_1.JOB_APPLICATION_STATUS.WaitingForApproval) {
                    throw new customError_1.default(`You cannot perform this action because the job application is not awaiting approval.`, this.StatusCode.HTTP_FORBIDDEN);
                }
                const application = yield jobApplicationModel.getMyJobApplication({
                    job_application_id: taskActivity.job_application_id,
                    job_seeker_id: taskActivity.job_seeker_id,
                });
                if (!application) {
                    throw new customError_1.default(`Job application not found or does not belong to you.`, this.StatusCode.HTTP_NOT_FOUND);
                }
                yield jobApplicationModel.updateMyJobApplicationStatus(taskActivity.job_application_id, taskActivity.job_seeker_id, constants_1.JOB_APPLICATION_STATUS.ASSIGNED);
                yield jobTaskActivitiesModel.updateJobTaskActivity(taskActivity.id, {
                    start_time: new Date(),
                    start_approved_at: new Date().toISOString(),
                });
                yield jobPostModel.updateJobPostDetailsStatus(application.job_post_details_id, constants_1.JOB_POST_DETAILS_STATUS.In_Progress);
                return {
                    success: true,
                    message: this.ResMsg.HTTP_OK,
                    code: this.StatusCode.HTTP_OK,
                };
            }));
        });
        this.createJobTaskList = (req) => __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const jobApplicationModel = this.Model.jobApplicationModel(trx);
                const jobTaskActivitiesModel = this.Model.jobTaskActivitiesModel(trx);
                const jobTaskListModel = this.Model.jobTaskListModel(trx);
                const { user_id } = req.hotelier;
                // Validate task activity
                const taskActivity = yield jobTaskActivitiesModel.getSingleTaskActivity({
                    id: body.job_task_activity_id,
                });
                if (!taskActivity) {
                    throw new customError_1.default("Task activity not found", this.StatusCode.HTTP_NOT_FOUND);
                }
                console.log({ taskActivity });
                if (taskActivity.application_status !==
                    constants_1.JOB_APPLICATION_STATUS.ASSIGNED &&
                    !taskActivity.start_time) {
                    throw new customError_1.default(`You cannot perform this action because the application is not in progress. Your application status is ${taskActivity.application_status}`, this.StatusCode.HTTP_FORBIDDEN);
                }
                // Build insert payload
                const taskList = body.tasks.map((task) => ({
                    job_task_activity_id: body.job_task_activity_id,
                    message: task.message,
                }));
                const res = yield jobTaskListModel.createJobTaskList(taskList);
                if (!res.length) {
                    throw new customError_1.default("Failed to create job task list", this.StatusCode.HTTP_BAD_REQUEST);
                }
                yield jobApplicationModel.updateMyJobApplicationStatus(taskActivity.job_application_id, taskActivity.job_seeker_id, constants_1.JOB_APPLICATION_STATUS.IN_PROGRESS);
                yield this.insertNotification(trx, userModelTypes_1.TypeUser.JOB_SEEKER, {
                    user_id: taskActivity.job_seeker_id,
                    content: `New tasks have been assigned to you.`,
                    related_id: taskActivity.job_application_id,
                    type: commonModelTypes_1.NotificationTypeEnum.JOB_TASK,
                });
                const allMessages = taskList
                    .map((task, index) => `${index + 1}. ${task.message}`)
                    .join("\n");
                socket_1.io.emit("create:job-task-list", {
                    id: res[0].id,
                    job_task_activity_id: body.job_task_activity_id,
                    message: allMessages,
                    is_completed: false,
                    completed_at: null,
                    created_at: new Date().toISOString(),
                    job_seeker_id: taskActivity.job_seeker_id,
                    job_seeker_name: taskActivity.job_seeker_name,
                });
                console.log(4);
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
                    throw new customError_1.default("Job task not found. Please create task to proceed.", this.StatusCode.HTTP_NOT_FOUND);
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
                    throw new customError_1.default("Job task not found. Please create task to proceed.", this.StatusCode.HTTP_NOT_FOUND);
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
        this.approveEndJobTaskActivity = (req) => __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const paymentModel = this.Model.paymnentModel(trx);
                const jobPostModel = this.Model.jobPostModel(trx);
                const jobApplicationModel = this.Model.jobApplicationModel(trx);
                const jobTaskActivitiesModel = this.Model.jobTaskActivitiesModel(trx);
                const taskActivity = yield jobTaskActivitiesModel.getSingleTaskActivity({
                    id: Number(id),
                });
                if (taskActivity.application_status !==
                    constants_1.JOB_APPLICATION_STATUS.IN_PROGRESS) {
                    throw new customError_1.default(`You cannot perform this action because the application is still in progress.`, this.StatusCode.HTTP_FORBIDDEN);
                }
                const application = yield jobApplicationModel.getMyJobApplication({
                    job_application_id: taskActivity.job_application_id,
                    job_seeker_id: taskActivity.job_seeker_id,
                });
                if (!application) {
                    throw new customError_1.default(`Job application not found or does not belong to you.`, this.StatusCode.HTTP_NOT_FOUND);
                }
                const jobPost = yield jobPostModel.getSingleJobPostForAdmin(application.job_post_details_id);
                yield jobApplicationModel.updateMyJobApplicationStatus(taskActivity.job_application_id, taskActivity.job_seeker_id, constants_1.JOB_APPLICATION_STATUS.ENDED);
                const startTime = (0, dayjs_1.default)(taskActivity.start_time).valueOf();
                const endTime = (0, dayjs_1.default)(new Date()).valueOf();
                const totalMinutes = Math.floor((endTime - startTime) / (1000 * 60));
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                const totalWorkingHours = Number(`${hours}.${minutes < 10 ? "0" + minutes : minutes}`);
                const lastPaymentId = yield paymentModel.getLastPaymentId();
                const payId = lastPaymentId && (lastPaymentId === null || lastPaymentId === void 0 ? void 0 : lastPaymentId.split("-")[2]);
                const paymentId = Number(payId) + 1;
                const paymentPayload = {
                    application_id: application.job_application_id,
                    total_amount: Number((totalWorkingHours * Number(jobPost.hourly_rate)).toFixed(2)),
                    status: constants_1.PAYMENT_STATUS.UNPAID,
                    job_seeker_pay: Number((totalWorkingHours * Number(jobPost.job_seeker_pay)).toFixed(2)),
                    platform_fee: Number((totalWorkingHours * Number(jobPost.platform_fee)).toFixed(2)),
                    payment_no: `TVZ-PAY-${paymentId}`,
                };
                console.log({ paymentPayload });
                yield paymentModel.initializePayment(paymentPayload);
                console.log(1);
                yield jobTaskActivitiesModel.updateJobTaskActivity(taskActivity.id, {
                    end_approved_at: new Date(),
                    total_working_hours: totalWorkingHours,
                });
                console.log(2);
                yield jobPostModel.updateJobPostDetailsStatus(application.job_post_details_id, constants_1.JOB_POST_DETAILS_STATUS.WorkFinished);
                // await jobPostModel.updateJobPostDetailsStatus(
                // 	application.job_post_details_id,
                // 	JOB_POST_DETAILS_STATUS.In_Progress
                // );
                socket_1.io.to(String(taskActivity.job_seeker_id)).emit("approve-end-job-task", {
                    id,
                    start_time: taskActivity.start_time,
                    end_time: taskActivity.end_time,
                    total_working_hours: totalWorkingHours,
                    end_approved_at: new Date(),
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
exports.default = HotelierJobTaskActivitiesService;
