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
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
class HotelierJobTaskActivitiesService extends abstract_service_1.default {
    constructor() {
        super();
        this.approveJobTaskActivity = (req) => __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { user_id } = req.hotelier;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const userModel = this.Model.UserModel(trx);
                const jobPostModel = this.Model.jobPostModel(trx);
                const jobApplicationModel = this.Model.jobApplicationModel(trx);
                const jobTaskActivitiesModel = this.Model.jobTaskActivitiesModel(trx);
                const hotelier = yield userModel.checkUser({
                    id: user_id,
                    type: userModelTypes_1.TypeUser.HOTELIER,
                });
                if (hotelier && hotelier.length < 1) {
                    throw new customError_1.default("Organization not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                const taskActivity = yield jobTaskActivitiesModel.getSingleTaskActivity({
                    id: Number(id),
                });
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
                yield jobApplicationModel.updateMyJobApplicationStatus({
                    application_id: taskActivity.job_application_id,
                    job_seeker_id: taskActivity.job_seeker_id,
                    status: constants_1.JOB_APPLICATION_STATUS.ASSIGNED,
                });
                const res = yield jobTaskActivitiesModel.updateJobTaskActivity(taskActivity.id, {
                    start_approved_at: new Date(),
                });
                yield jobPostModel.updateJobPostDetailsStatus({
                    id: application.job_post_details_id,
                    status: constants_1.JOB_POST_DETAILS_STATUS.In_Progress,
                });
                const isJobSeekerExists = yield userModel.checkUser({
                    id: taskActivity.job_seeker_id,
                });
                if (isJobSeekerExists && isJobSeekerExists.length < 1) {
                    throw new customError_1.default("Job Seeker not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                yield this.insertNotification(trx, userModelTypes_1.TypeUser.JOB_SEEKER, {
                    user_id: taskActivity.job_seeker_id,
                    sender_id: user_id,
                    sender_type: constants_1.USER_TYPE.HOTELIER,
                    title: this.NotificationMsg.JOB_ASSIGNED.title,
                    content: this.NotificationMsg.JOB_ASSIGNED.content({
                        id: application.job_post_details_id,
                        jobTitle: application.job_post_title,
                    }),
                    related_id: res[0].id,
                    type: commonModelTypes_1.NotificationTypeEnum.JOB_TASK,
                });
                const isJobSeekerOnline = yield (0, socket_1.getAllOnlineSocketIds)({
                    user_id: taskActivity.job_seeker_id,
                    type: userModelTypes_1.TypeUser.JOB_SEEKER,
                });
                if (isJobSeekerOnline && isJobSeekerOnline.length > 0) {
                    socket_1.io.to(String(taskActivity.job_seeker_id)).emit(commonModelTypes_1.TypeEmitNotificationEnum.JOB_SEEKER_NEW_NOTIFICATION, {
                        user_id: taskActivity.job_seeker_id,
                        photo: hotelier[0].photo,
                        title: this.NotificationMsg.JOB_ASSIGNED.title,
                        content: this.NotificationMsg.JOB_ASSIGNED.content({
                            id: application.job_post_details_id,
                            jobTitle: application.job_post_title,
                        }),
                        related_id: res[0].id,
                        type: commonModelTypes_1.NotificationTypeEnum.JOB_TASK,
                        read_status: false,
                        created_at: new Date().toISOString(),
                    });
                }
                else {
                    if (isJobSeekerExists[0].device_id) {
                        yield lib_1.default.sendNotificationToMobile({
                            to: isJobSeekerExists[0].device_id,
                            notificationTitle: this.NotificationMsg.JOB_ASSIGNED.title,
                            notificationBody: this.NotificationMsg.JOB_ASSIGNED.content({
                                id: application.job_post_details_id,
                                jobTitle: application.job_post_title,
                            }),
                            data: {
                                photo: hotelier[0].photo,
                            },
                        });
                    }
                }
                return {
                    success: true,
                    message: this.ResMsg.HTTP_OK,
                    code: this.StatusCode.HTTP_OK,
                };
            }));
        });
        this.createJobTaskList = (req) => __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.hotelier;
            const body = req.body;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const userModel = this.Model.UserModel(trx);
                const jobApplicationModel = this.Model.jobApplicationModel(trx);
                const jobTaskActivitiesModel = this.Model.jobTaskActivitiesModel(trx);
                const jobTaskListModel = this.Model.jobTaskListModel(trx);
                const hotelier = yield userModel.checkUser({
                    id: user_id,
                    type: userModelTypes_1.TypeUser.HOTELIER,
                });
                if (hotelier && hotelier.length < 1) {
                    throw new customError_1.default("Organization nor found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                // Validate task activity
                const taskActivity = yield jobTaskActivitiesModel.getSingleTaskActivity({
                    id: body.job_task_activity_id,
                });
                if (!taskActivity) {
                    throw new customError_1.default("Task activity not found", this.StatusCode.HTTP_NOT_FOUND);
                }
                if (taskActivity.application_status !==
                    constants_1.JOB_APPLICATION_STATUS.ASSIGNED &&
                    !taskActivity.start_time) {
                    throw new customError_1.default(`You cannot perform this action because the application is not in progress. Your application status is ${taskActivity.application_status}`, this.StatusCode.HTTP_FORBIDDEN);
                }
                if (taskActivity.end_time) {
                    throw new customError_1.default("You cannot add task. Because It has already been submitted for approval.", this.StatusCode.HTTP_BAD_REQUEST);
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
                yield jobApplicationModel.updateMyJobApplicationStatus({
                    application_id: taskActivity.job_application_id,
                    job_seeker_id: taskActivity.job_seeker_id,
                    status: constants_1.JOB_APPLICATION_STATUS.IN_PROGRESS,
                });
                const isJobSeekerExists = yield userModel.checkUser({
                    id: taskActivity.job_seeker_id,
                });
                if (isJobSeekerExists && isJobSeekerExists.length < 1) {
                    throw new customError_1.default("Job Seeker not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                const allMessages = taskList
                    .map((task, index) => `${index + 1}. ${task.message}`)
                    .join("\n");
                yield this.insertNotification(trx, userModelTypes_1.TypeUser.JOB_SEEKER, {
                    user_id: taskActivity.job_seeker_id,
                    sender_id: user_id,
                    sender_type: constants_1.USER_TYPE.HOTELIER,
                    title: this.NotificationMsg.NEW_TASKS_ASSIGNED.title,
                    content: allMessages,
                    related_id: taskActivity.job_application_id,
                    type: commonModelTypes_1.NotificationTypeEnum.JOB_TASK,
                });
                const isJobSeekerOnline = yield (0, socket_1.getAllOnlineSocketIds)({
                    user_id: taskActivity.job_seeker_id,
                    type: userModelTypes_1.TypeUser.JOB_SEEKER,
                });
                if (isJobSeekerOnline && isJobSeekerOnline.length > 0) {
                    socket_1.io.to(String(taskActivity.job_seeker_id)).emit(commonModelTypes_1.TypeEmitNotificationEnum.JOB_SEEKER_NEW_NOTIFICATION, {
                        user_id: taskActivity.job_seeker_id,
                        photo: hotelier[0].photo,
                        title: this.NotificationMsg.NEW_TASKS_ASSIGNED.title,
                        content: allMessages,
                        related_id: res[0].id,
                        type: commonModelTypes_1.NotificationTypeEnum.JOB_TASK,
                        read_status: false,
                        created_at: new Date().toISOString(),
                    });
                }
                else {
                    if (isJobSeekerExists[0].device_id) {
                        yield lib_1.default.sendNotificationToMobile({
                            to: isJobSeekerExists[0].device_id,
                            notificationTitle: this.NotificationMsg.NEW_TASKS_ASSIGNED.title,
                            notificationBody: allMessages,
                            data: {
                                photo: hotelier[0].photo,
                            },
                        });
                    }
                }
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
            console.log({ id });
            const { user_id } = req.hotelier;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const userModel = this.Model.UserModel(trx);
                const paymentModel = this.Model.paymnentModel(trx);
                const jobPostModel = this.Model.jobPostModel(trx);
                const jobApplicationModel = this.Model.jobApplicationModel(trx);
                const jobTaskActivitiesModel = this.Model.jobTaskActivitiesModel(trx);
                const hotelier = yield userModel.checkUser({
                    id: user_id,
                    type: userModelTypes_1.TypeUser.HOTELIER,
                });
                if (hotelier && hotelier.length < 1) {
                    throw new customError_1.default("Organization nor found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                const taskActivity = yield jobTaskActivitiesModel.getSingleTaskActivity({
                    id: Number(id),
                });
                console.log({ taskActivity });
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
                yield jobApplicationModel.updateMyJobApplicationStatus({
                    application_id: taskActivity.job_application_id,
                    job_seeker_id: taskActivity.job_seeker_id,
                    status: constants_1.JOB_APPLICATION_STATUS.ENDED,
                });
                const startTime = (0, dayjs_1.default)(taskActivity.start_time).valueOf();
                const endTime = (0, dayjs_1.default)(new Date()).valueOf();
                const totalMinutes = Math.floor((endTime - startTime) / (1000 * 60));
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                const totalWorkingHours = Number(`${hours}.${minutes < 10 ? "0" + minutes : minutes}`);
                const lastPaymentId = yield paymentModel.getLastPaymentId();
                const payId = lastPaymentId && (lastPaymentId === null || lastPaymentId === void 0 ? void 0 : lastPaymentId.split("-")[2]);
                const paymentId = Number(payId) + 1;
                const hourlyRate = Number(jobPost.hourly_rate);
                const jobSeekerPayRate = Number(jobPost.job_seeker_pay);
                const platformFeeRate = Number(jobPost.platform_fee);
                // Transaction fee (e.g., 2.9% + 0.30)
                const feePercentage = 0.029;
                const fixedFee = 0.3;
                const baseAmount = Number((totalWorkingHours * hourlyRate).toFixed(2));
                const totalAmount = Number(((baseAmount + fixedFee) / (1 - feePercentage)).toFixed(2));
                const transactionFee = Number((totalAmount - baseAmount).toFixed(2));
                const jobSeekerPay = Number((totalWorkingHours * jobSeekerPayRate).toFixed(2));
                const platformFee = Number((totalWorkingHours * platformFeeRate).toFixed(2));
                console.log({ platformFee });
                console.log({ transactionFee });
                console.log({ totalAmount });
                const paymentPayload = {
                    application_id: application.job_application_id,
                    total_amount: totalAmount,
                    status: constants_1.PAYMENT_STATUS.UNPAID,
                    job_seeker_pay: jobSeekerPay,
                    platform_fee: platformFee,
                    trx_fee: transactionFee,
                    payment_no: `TVZ-PAY-${paymentId}`,
                };
                yield paymentModel.initializePayment(paymentPayload);
                const res = yield jobTaskActivitiesModel.updateJobTaskActivity(taskActivity.id, {
                    end_approved_at: new Date(),
                    total_working_hours: totalWorkingHours,
                });
                yield jobPostModel.updateJobPostDetailsStatus({
                    id: application.job_post_details_id,
                    status: constants_1.JOB_POST_DETAILS_STATUS.WorkFinished,
                });
                const isJobSeekerExists = yield userModel.checkUser({
                    id: taskActivity.job_seeker_id,
                });
                if (isJobSeekerExists && isJobSeekerExists.length < 1) {
                    throw new customError_1.default("Job Seeker not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                yield this.insertNotification(trx, userModelTypes_1.TypeUser.JOB_SEEKER, {
                    user_id: taskActivity.job_seeker_id,
                    sender_id: user_id,
                    sender_type: constants_1.USER_TYPE.HOTELIER,
                    title: this.NotificationMsg.TASK_UNDER_REVIEW.title,
                    content: this.NotificationMsg.TASK_UNDER_REVIEW.content(application.job_post_details_id),
                    related_id: res[0].id,
                    type: commonModelTypes_1.NotificationTypeEnum.JOB_TASK,
                });
                const isJobSeekerOnline = yield (0, socket_1.getAllOnlineSocketIds)({
                    user_id: taskActivity.job_seeker_id,
                    type: userModelTypes_1.TypeUser.JOB_SEEKER,
                });
                if (isJobSeekerOnline && isJobSeekerOnline.length > 0) {
                    socket_1.io.to(String(taskActivity.job_seeker_id)).emit(commonModelTypes_1.TypeEmitNotificationEnum.JOB_SEEKER_NEW_NOTIFICATION, {
                        user_id: taskActivity.job_seeker_id,
                        photo: hotelier[0].photo,
                        title: this.NotificationMsg.TASK_UNDER_REVIEW.title,
                        content: this.NotificationMsg.TASK_UNDER_REVIEW.content(application.job_post_details_id),
                        related_id: res[0].id,
                        type: commonModelTypes_1.NotificationTypeEnum.JOB_TASK,
                        read_status: false,
                        created_at: new Date().toISOString(),
                    });
                }
                else {
                    if (isJobSeekerExists[0].device_id) {
                        yield lib_1.default.sendNotificationToMobile({
                            to: isJobSeekerExists[0].device_id,
                            notificationTitle: this.NotificationMsg.TASK_UNDER_REVIEW.title,
                            notificationBody: this.NotificationMsg.TASK_UNDER_REVIEW.content(application.job_post_details_id),
                            data: {
                                photo: hotelier[0].photo,
                            },
                        });
                    }
                }
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
