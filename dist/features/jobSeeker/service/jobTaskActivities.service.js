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
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
class JobTaskActivitiesService extends abstract_service_1.default {
    constructor() {
        super();
        this.startJobTaskActivities = (req) => __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.jobSeeker;
            const { job_application_id, job_post_details_id } = req.body;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const userModel = this.Model.UserModel(trx);
                const jobApplicationModel = this.Model.jobApplicationModel(trx);
                const jobTaskActivitiesModel = this.Model.jobTaskActivitiesModel(trx);
                const jobSeeker = yield userModel.checkUser({
                    id: user_id,
                    type: userModelTypes_1.TypeUser.JOB_SEEKER,
                });
                if (jobSeeker && jobSeeker.length < 1) {
                    throw new customError_1.default("Job seeker not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                const myApplication = yield jobApplicationModel.getMyJobApplication({
                    job_application_id,
                    job_seeker_id: user_id,
                });
                if (!myApplication) {
                    throw new customError_1.default(`Job application not found or does not belong to you.`, this.StatusCode.HTTP_NOT_FOUND);
                }
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
                    start_time: new Date(),
                };
                const res = yield jobTaskActivitiesModel.createJobTaskActivity(payload);
                yield jobApplicationModel.updateMyJobApplicationStatus({
                    application_id: job_application_id,
                    job_seeker_id: user_id,
                    status: constants_1.JOB_APPLICATION_STATUS.WaitingForApproval,
                });
                const isHotelierExists = yield userModel.checkUser({
                    id: myApplication.hotelier_id,
                });
                if (isHotelierExists && isHotelierExists.length < 1) {
                    throw new customError_1.default("Organization not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                yield this.insertNotification(trx, userModelTypes_1.TypeUser.HOTELIER, {
                    user_id: myApplication.hotelier_id,
                    sender_id: user_id,
                    sender_type: constants_1.USER_TYPE.JOB_SEEKER,
                    title: this.NotificationMsg.WAITING_FOR_APPROVAL.title,
                    content: this.NotificationMsg.WAITING_FOR_APPROVAL.content({
                        id: myApplication.job_post_details_id,
                        jobTitle: myApplication.job_post_title,
                    }),
                    related_id: res[0].id,
                    type: commonModelTypes_1.NotificationTypeEnum.JOB_TASK,
                });
                const isHotelierOnline = yield (0, socket_1.getAllOnlineSocketIds)({
                    user_id: myApplication.hotelier_id,
                    type: userModelTypes_1.TypeUser.HOTELIER,
                });
                if (isHotelierOnline && isHotelierOnline.length > 0) {
                    socket_1.io.to(String(myApplication.hotelier_id)).emit(commonModelTypes_1.TypeEmitNotificationEnum.HOTELIER_NEW_NOTIFICATION, {
                        user_id: myApplication.hotelier_id,
                        photo: jobSeeker[0].photo,
                        title: this.NotificationMsg.WAITING_FOR_APPROVAL.title,
                        content: this.NotificationMsg.WAITING_FOR_APPROVAL.content({
                            id: myApplication.job_post_details_id,
                            jobTitle: myApplication.job_post_title,
                        }),
                        related_id: res[0].id,
                        type: commonModelTypes_1.NotificationTypeEnum.JOB_TASK,
                        read_status: false,
                        created_at: new Date().toISOString(),
                    });
                }
                else {
                    if (isHotelierExists[0].device_id) {
                        yield lib_1.default.sendNotificationToMobile({
                            to: isHotelierExists[0].device_id,
                            notificationTitle: this.NotificationMsg.WAITING_FOR_APPROVAL.title,
                            notificationBody: this.NotificationMsg.WAITING_FOR_APPROVAL.content({
                                id: myApplication.job_post_details_id,
                                jobTitle: myApplication.job_post_title,
                            }),
                            data: {
                                photo: jobSeeker[0].photo,
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
        this.toggleTaskCompletionStatus = (req) => __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.jobSeeker;
            const id = Number(req.params.id);
            const is_completed = req.query.is_completed;
            const isCompleted = is_completed === "1" ? true : false;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const userModel = this.Model.UserModel(trx);
                const jobTaskListModel = this.Model.jobTaskListModel(trx);
                const jobSeeker = yield userModel.checkUser({
                    id: user_id,
                    type: userModelTypes_1.TypeUser.JOB_SEEKER,
                });
                if (jobSeeker && jobSeeker.length < 1) {
                    throw new customError_1.default("Job seeker not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
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
                const isHotelierExists = yield userModel.checkUser({
                    id: taskList[0].hotelier_id,
                });
                if (isHotelierExists && isHotelierExists.length < 1) {
                    throw new customError_1.default("Organization not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                yield this.insertNotification(trx, userModelTypes_1.TypeUser.HOTELIER, {
                    user_id: taskList[0].hotelier_id,
                    sender_id: user_id,
                    sender_type: constants_1.USER_TYPE.JOB_SEEKER,
                    title: this.NotificationMsg.TASK_STATUS.title(taskList[0].is_completed),
                    content: this.NotificationMsg.TASK_STATUS.content(taskList[0].id, taskList[0].is_completed),
                    related_id: taskList[0].id,
                    type: commonModelTypes_1.NotificationTypeEnum.JOB_TASK,
                });
                const isHotelierOnline = yield (0, socket_1.getAllOnlineSocketIds)({
                    user_id: taskList[0].hotelier_id,
                    type: userModelTypes_1.TypeUser.HOTELIER,
                });
                if (isHotelierOnline && isHotelierOnline.length > 0) {
                    socket_1.io.to(String(taskList[0].hotelier_id)).emit(commonModelTypes_1.TypeEmitNotificationEnum.HOTELIER_NEW_NOTIFICATION, {
                        user_id: taskList[0].hotelier_id,
                        photo: jobSeeker[0].photo,
                        title: this.NotificationMsg.TASK_STATUS.title(taskList[0].is_completed),
                        content: this.NotificationMsg.TASK_STATUS.content(taskList[0].id, taskList[0].is_completed),
                        related_id: taskList[0].id,
                        type: commonModelTypes_1.NotificationTypeEnum.JOB_TASK,
                        read_status: false,
                        created_at: new Date().toISOString(),
                    });
                }
                else {
                    if (isHotelierExists[0].device_id) {
                        yield lib_1.default.sendNotificationToMobile({
                            to: isHotelierExists[0].device_id,
                            notificationTitle: this.NotificationMsg.TASK_STATUS.title(taskList[0].is_completed),
                            notificationBody: this.NotificationMsg.TASK_STATUS.content(taskList[0].id, taskList[0].is_completed),
                            data: {
                                photo: jobSeeker[0].photo,
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
        this.endJobTaskActivities = (req) => __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { user_id } = req.jobSeeker;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const userModel = this.Model.UserModel(trx);
                const jobApplicationModel = this.Model.jobApplicationModel(trx);
                const jobTaskActivitiesModel = this.Model.jobTaskActivitiesModel(trx);
                const jobTaskListModel = this.Model.jobTaskListModel(trx);
                const jobSeeker = yield userModel.checkUser({ id: user_id });
                if (!jobSeeker) {
                    throw new customError_1.default("Job Seeker not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
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
                if (!taskList.length || taskList.length === 0) {
                    throw new customError_1.default("The organization has not assigned any tasks for this job yet. Please wait until tasks are assigned.", this.StatusCode.HTTP_BAD_REQUEST);
                }
                const incompleteTasks = taskList.filter((task) => !task.is_completed);
                if (incompleteTasks.length > 0) {
                    throw new customError_1.default("There are incomplete tasks that must be finished before proceeding.", this.StatusCode.HTTP_BAD_REQUEST);
                }
                const myApplication = yield jobApplicationModel.getMyJobApplication({
                    job_application_id: taskActivity.job_application_id,
                    job_seeker_id: taskActivity.job_seeker_id,
                });
                if (!myApplication) {
                    throw new customError_1.default(`Job application not found or does not belong to you.`, this.StatusCode.HTTP_NOT_FOUND);
                }
                const res = yield jobTaskActivitiesModel.updateJobTaskActivity(taskActivity.id, {
                    end_time: new Date(),
                });
                const isHotelierExists = yield userModel.checkUser({
                    id: myApplication.hotelier_id,
                });
                if (isHotelierExists && isHotelierExists.length < 1) {
                    throw new customError_1.default("Organization not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                yield this.insertNotification(trx, userModelTypes_1.TypeUser.HOTELIER, {
                    user_id: myApplication.hotelier_id,
                    sender_id: user_id,
                    sender_type: constants_1.USER_TYPE.JOB_SEEKER,
                    title: this.NotificationMsg.JOB_ASSIGNED.title,
                    content: this.NotificationMsg.JOB_ASSIGNED.content({
                        id: taskActivity.job_post_details_id,
                        jobTitle: myApplication.job_post_title,
                    }),
                    related_id: res[0].id,
                    type: commonModelTypes_1.NotificationTypeEnum.JOB_TASK,
                });
                const isHotelierOnline = yield (0, socket_1.getAllOnlineSocketIds)({
                    user_id: myApplication.hotelier_id,
                    type: userModelTypes_1.TypeUser.HOTELIER,
                });
                if (isHotelierOnline && isHotelierOnline.length > 0) {
                    socket_1.io.to(String(myApplication.hotelier_id)).emit("end-job", {
                        user_id: myApplication.hotelier_id,
                        photo: jobSeeker[0].photo,
                        title: this.NotificationMsg.JOB_ASSIGNED.title,
                        content: this.NotificationMsg.JOB_ASSIGNED.content({
                            id: taskActivity.job_post_details_id,
                            jobTitle: myApplication.job_post_title,
                        }),
                        related_id: res[0].id,
                        type: commonModelTypes_1.NotificationTypeEnum.JOB_TASK,
                        read_status: false,
                        created_at: new Date().toISOString(),
                    });
                }
                else {
                    if (isHotelierExists[0].device_id) {
                        yield lib_1.default.sendNotificationToMobile({
                            to: isHotelierExists[0].device_id,
                            notificationTitle: this.NotificationMsg.JOB_ASSIGNED.title,
                            notificationBody: this.NotificationMsg.JOB_ASSIGNED.content({
                                id: taskActivity.job_post_details_id,
                                jobTitle: myApplication.job_post_title,
                            }),
                            data: {
                                photo: jobSeeker[0].photo,
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
exports.default = JobTaskActivitiesService;
