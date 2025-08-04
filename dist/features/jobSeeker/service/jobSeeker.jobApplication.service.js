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
const userModel_1 = __importDefault(require("../../../models/userModel/userModel"));
const userModelTypes_1 = require("../../../utils/modelTypes/user/userModelTypes");
const commonModelTypes_1 = require("../../../utils/modelTypes/common/commonModelTypes");
const socket_1 = require("../../../app/socket");
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
class JobSeekerJobApplication extends abstract_service_1.default {
    constructor() {
        super();
        this.createJobApplication = (req) => __awaiter(this, void 0, void 0, function* () {
            const { job_post_details_id } = req.body;
            const { user_id } = req.jobSeeker;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const userModel = new userModel_1.default(trx);
                const jobPostModel = new jobPostModel_1.default(trx);
                const cancellationLogModel = new cancellationLogModel_1.default(trx);
                const jobSeeker = yield userModel.checkUser({
                    id: user_id,
                    type: userModelTypes_1.TypeUser.JOB_SEEKER,
                });
                if (jobSeeker && jobSeeker.length < 1) {
                    throw new customError_1.default("Job seeker not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                const jobPost = yield jobPostModel.getSingleJobPostForJobSeeker(job_post_details_id);
                if (!jobPost) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                }
                if (jobPost.status !==
                    constants_1.JOB_POST_DETAILS_STATUS.Pending) {
                    throw new customError_1.default("This job post is no longer accepting applications.", this.StatusCode.HTTP_BAD_REQUEST);
                }
                const jobPostReport = yield cancellationLogModel.getSingleJobPostCancellationLog({
                    id: null,
                    report_type: constants_1.CANCELLATION_REPORT_TYPE.CANCEL_JOB_POST,
                    related_id: job_post_details_id,
                });
                if (jobPostReport &&
                    jobPostReport.status === constants_1.CANCELLATION_REPORT_STATUS.PENDING) {
                    throw new customError_1.default("A cancellation request is already pending for this job post.", this.StatusCode.HTTP_CONFLICT);
                }
                const model = this.Model.jobApplicationModel(trx);
                const existPendingApplication = yield model.getMyJobApplication({
                    job_seeker_id: user_id,
                });
                if (existPendingApplication &&
                    (existPendingApplication.job_application_status ===
                        constants_1.JOB_APPLICATION_STATUS.PENDING ||
                        existPendingApplication.job_application_status ===
                            constants_1.JOB_APPLICATION_STATUS.IN_PROGRESS)) {
                    throw new customError_1.default("Hold on! You need to complete your current job before moving on to the next.", this.StatusCode.HTTP_BAD_REQUEST);
                }
                const payload = {
                    job_post_details_id: Number(job_post_details_id),
                    job_seeker_id: user_id,
                    job_post_id: jobPost.job_post_id,
                };
                yield model.createJobApplication(payload);
                yield model.markJobPostDetailAsApplied(Number(job_post_details_id));
                const isSaveJobExists = yield jobPostModel.checkSaveJob({
                    job_post_details_id,
                });
                if (isSaveJobExists) {
                    yield jobPostModel.deleteSavedJob({ job_post_details_id });
                }
                const hotelier = yield userModel.checkUser({
                    id: jobPost.hotelier_id,
                    type: userModelTypes_1.TypeUser.HOTELIER,
                });
                if (hotelier && hotelier.length < 1) {
                    throw new customError_1.default("Organization not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                const startTime = new Date(jobPost.start_time);
                const reminderTime = new Date(startTime.getTime() - 2 * 60 * 60 * 1000);
                const jobStartReminderQueue = this.getQueue("jobStartReminder");
                yield jobStartReminderQueue.add("jobStartReminder", {
                    id: jobPost.id,
                    hotelier_id: jobPost.hotelier_id,
                    job_seeker_id: user_id,
                    photo: hotelier[0].photo,
                    title: this.NotificationMsg.JOB_START_REMINDER.title,
                    content: this.NotificationMsg.JOB_START_REMINDER.content({
                        jobTitle: jobPost.job_title,
                        startTime: new Date(jobPost.start_time),
                    }),
                    type: commonModelTypes_1.NotificationTypeEnum.JOB_TASK,
                    related_id: jobPost.id,
                    job_seeker_device_id: jobSeeker[0].device_id,
                }, {
                    delay: reminderTime.getTime() - Date.now(),
                    removeOnComplete: true,
                    removeOnFail: false,
                });
                yield this.insertNotification(trx, userModelTypes_1.TypeUser.HOTELIER, {
                    user_id: jobPost.hotelier_id,
                    sender_id: user_id,
                    sender_type: userModelTypes_1.TypeUser.JOB_SEEKER,
                    title: this.NotificationMsg.JOB_APPLICATION_RECEIVED.title,
                    content: this.NotificationMsg.JOB_APPLICATION_RECEIVED.content({
                        jobTitle: jobPost.job_title,
                        jobPostId: jobPost.id,
                    }),
                    type: commonModelTypes_1.NotificationTypeEnum.APPLICATION_UPDATE,
                    related_id: jobPost.id,
                });
                const isHotelierOnline = yield (0, socket_1.getAllOnlineSocketIds)({
                    user_id: jobPost.hotelier_id,
                    type: userModelTypes_1.TypeUser.HOTELIER,
                });
                if (isHotelierOnline && isHotelierOnline.length > 0) {
                    socket_1.io.to(String(jobPost.hotelier_id)).emit(commonModelTypes_1.TypeEmitNotificationEnum.HOTELIER_NEW_NOTIFICATION, {
                        user_id,
                        photo: jobSeeker[0].photo,
                        title: this.NotificationMsg.JOB_APPLICATION_RECEIVED
                            .title,
                        content: this.NotificationMsg.JOB_APPLICATION_RECEIVED.content({
                            jobTitle: jobPost.job_title,
                            jobPostId: jobPost.id,
                        }),
                        related_id: jobPost.id,
                        type: commonModelTypes_1.NotificationTypeEnum.APPLICATION_UPDATE,
                        read_status: false,
                        created_at: new Date().toISOString(),
                    });
                }
                else {
                    if (hotelier[0].device_id) {
                        yield lib_1.default.sendNotificationToMobile({
                            to: hotelier[0].device_id,
                            notificationTitle: this.NotificationMsg.JOB_APPLICATION_RECEIVED.title,
                            notificationBody: this.NotificationMsg.JOB_APPLICATION_RECEIVED.content({
                                jobTitle: jobPost.job_title,
                                jobPostId: jobPost.id,
                            }),
                            data: {
                                photo: jobSeeker[0].photo,
                                related_id: jobPost.id,
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
                if (application.job_application_status !==
                    constants_1.JOB_APPLICATION_STATUS.PENDING) {
                    throw new customError_1.default("This application cannot be cancelled because it has already been processed.", this.StatusCode.HTTP_BAD_REQUEST);
                }
                const cancellationLogModel = this.Model.cancellationLogModel(trx);
                const isReportExists = yield cancellationLogModel.getSingleCancellationLogWithRelatedId(Number(id));
                if (isReportExists) {
                    throw new customError_1.default("A cancellation report for this application is already pending.", this.StatusCode.HTTP_BAD_REQUEST);
                }
                const currentTime = new Date();
                const startTime = new Date(application === null || application === void 0 ? void 0 : application.start_time);
                const hoursDiff = (startTime.getTime() - currentTime.getTime()) /
                    (1000 * 60 * 60);
                if (hoursDiff > 24) {
                    const data = yield applicationModel.updateMyJobApplicationStatus({
                        application_id: parseInt(id),
                        job_seeker_id: user_id,
                        status: constants_1.JOB_APPLICATION_STATUS.CANCELLED,
                    });
                    if (!data) {
                        throw new customError_1.default("Application data with the requested id not found", this.StatusCode.HTTP_NOT_FOUND);
                    }
                    yield jobPostModel.updateJobPostDetailsStatus({
                        id: data.job_post_details_id,
                        status: constants_1.JOB_POST_DETAILS_STATUS.Pending,
                    });
                    return {
                        success: true,
                        message: this.ResMsg.HTTP_OK,
                        code: this.StatusCode.HTTP_OK,
                    };
                }
                else {
                    if (body.report_type !==
                        constants_1.CANCELLATION_REPORT_TYPE.CANCEL_APPLICATION ||
                        !body.reason) {
                        throw new customError_1.default("Cancellation report must include a valid reason and type 'CANCEL_APPLICATION'.", this.StatusCode.HTTP_UNPROCESSABLE_ENTITY);
                    }
                    body.reporter_id = user_id;
                    body.related_id = id;
                    const cancellationReportModel = this.Model.cancellationLogModel(trx);
                    console.log({ body });
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
