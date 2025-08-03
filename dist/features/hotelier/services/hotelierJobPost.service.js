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
const socket_1 = require("../../../app/socket");
const userModelTypes_1 = require("../../../utils/modelTypes/user/userModelTypes");
const commonModelTypes_1 = require("../../../utils/modelTypes/common/commonModelTypes");
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
class HotelierJobPostService extends abstract_service_1.default {
    createJobPost(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.hotelier;
            const body = req.body;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const userModel = this.Model.UserModel(trx);
                const jobSeeker = this.Model.jobSeekerModel(trx);
                const model = this.Model.jobPostModel(trx);
                const organizationModel = this.Model.organizationModel(trx);
                const jobModel = this.Model.jobModel(trx);
                const checkOrganization = yield organizationModel.getOrganization({
                    user_id,
                });
                if (!checkOrganization) {
                    throw new customError_1.default("Organization not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                console.log({ checkOrganization });
                body.job_post.organization_id = checkOrganization.id;
                const res = yield model.createJobPost(body.job_post);
                if (!res.length) {
                    throw new customError_1.default(this.ResMsg.HTTP_BAD_REQUEST, this.StatusCode.HTTP_BAD_REQUEST);
                }
                const jobPostDetails = [];
                for (const detail of body.job_post_details) {
                    const checkJob = yield jobModel.getSingleJob(detail.job_id);
                    if (!checkJob) {
                        throw new customError_1.default("Invalid Job Category!", this.StatusCode.HTTP_BAD_REQUEST);
                    }
                    if (new Date(detail.start_time) >= new Date(detail.end_time)) {
                        throw new customError_1.default("Job post start time cannot be greater than or equal to end time.", this.StatusCode.HTTP_BAD_REQUEST);
                    }
                    const expireTime = new Date(detail.start_time).getTime();
                    const now = Date.now();
                    const delay = Math.max(expireTime - now, 0);
                    const jobPostDetailsQueue = this.getQueue("expire-job-post-details");
                    yield jobPostDetailsQueue.add("expire-job-post-details", { id: res[0].id }, {
                        delay,
                        removeOnComplete: true,
                        removeOnFail: false,
                    });
                    jobPostDetails.push(Object.assign(Object.assign({}, detail), { job_post_id: res[0].id, hourly_rate: checkJob.hourly_rate, job_seeker_pay: checkJob.job_seeker_pay, platform_fee: checkJob.platform_fee }));
                }
                yield model.createJobPostDetails(jobPostDetails);
                // Job Post Nearby
                const orgLat = parseFloat(checkOrganization.latitude);
                const orgLng = parseFloat(checkOrganization.longitude);
                const all = yield jobSeeker.getJobSeekerLocation({});
                for (const seeker of all) {
                    const isSeekerExists = yield userModel.checkUser({
                        id: seeker.user_id,
                    });
                    if (isSeekerExists && isSeekerExists.length < 1) {
                        throw new customError_1.default("Job Seeker not found!", this.StatusCode.HTTP_NOT_FOUND);
                    }
                    const seekerLat = parseFloat(seeker.latitude);
                    const seekerLng = parseFloat(seeker.longitude);
                    const distance = lib_1.default.getDistanceFromLatLng(orgLat, orgLng, seekerLat, seekerLng);
                    if (distance > 10)
                        continue;
                    console.log(`Job seeker ${seeker.user_id} is within ${distance.toFixed(2)} km`);
                    yield this.insertNotification(trx, userModelTypes_1.TypeUser.JOB_SEEKER, {
                        user_id: seeker.user_id,
                        sender_id: user_id,
                        sender_type: constants_1.USER_TYPE.HOTELIER,
                        title: this.NotificationMsg.NEW_JOB_POST_NEARBY.title,
                        content: this.NotificationMsg.NEW_JOB_POST_NEARBY.content,
                        related_id: res[0].id,
                        type: commonModelTypes_1.NotificationTypeEnum.JOB_TASK,
                    });
                    const isJobSeekerOnline = yield (0, socket_1.getAllOnlineSocketIds)({
                        user_id: seeker.user_id,
                        type: seeker.type,
                    });
                    if (isJobSeekerOnline && isJobSeekerOnline.length > 0) {
                        socket_1.io.to(String(seeker.user_id)).emit(commonModelTypes_1.TypeEmitNotificationEnum.JOB_SEEKER_NEW_NOTIFICATION, {
                            user_id: seeker.user_id,
                            photo: checkOrganization.photo,
                            title: this.NotificationMsg.NEW_JOB_POST_NEARBY
                                .title,
                            content: this.NotificationMsg.NEW_JOB_POST_NEARBY
                                .content,
                            type: commonModelTypes_1.NotificationTypeEnum.JOB_TASK,
                            read_status: false,
                            created_at: new Date().toISOString(),
                        });
                    }
                    else {
                        if (isSeekerExists[0].device_id) {
                            yield lib_1.default.sendNotificationToMobile({
                                to: isSeekerExists[0].device_id,
                                notificationTitle: this.NotificationMsg.NEW_JOB_POST_NEARBY.title,
                                notificationBody: this.NotificationMsg.NEW_JOB_POST_NEARBY
                                    .content,
                            });
                        }
                    }
                }
                return {
                    success: true,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
    getJobPostList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, status, title } = req.query;
            const { user_id } = req.hotelier;
            const model = this.Model.jobPostModel();
            const data = yield model.getJobPostListForHotelier({
                user_id,
                limit,
                skip,
                status,
                title,
            });
            return Object.assign({ success: true, message: this.ResMsg.HTTP_OK, code: this.StatusCode.HTTP_OK }, data);
        });
    }
    getSingleJobPostForHotelier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const model = this.Model.jobPostModel();
            const data = yield model.getSingleJobPostForHotelier(Number(id));
            if (!data) {
                throw new customError_1.default("Job post not found!", this.StatusCode.HTTP_NOT_FOUND);
            }
            return {
                success: true,
                message: this.ResMsg.HTTP_OK,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    updateJobPost(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const body = req.body;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const jobModel = this.Model.jobModel(trx);
                const model = this.Model.jobPostModel(trx);
                const jobPost = yield model.getSingleJobPostForHotelier(Number(id));
                if (!jobPost) {
                    throw new customError_1.default("Job post not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                if (jobPost.job_post_details_status !==
                    constants_1.JOB_POST_DETAILS_STATUS.Pending) {
                    throw new customError_1.default("The job post cannot be updated because its status is not 'Pending'.", this.StatusCode.HTTP_BAD_REQUEST);
                }
                const hasJobPost = body.job_post && Object.keys(body.job_post).length > 0;
                const hasJobPostDetails = body.job_post_details &&
                    Object.keys(body.job_post_details).length > 0;
                if (hasJobPost) {
                    yield model.updateJobPost(Number(jobPost.job_post_id), body.job_post);
                }
                if (hasJobPostDetails) {
                    const { job_id, start_time, end_time } = body.job_post_details;
                    const job = yield jobModel.getSingleJob(job_id);
                    if (!job) {
                        throw new customError_1.default("The requested job with the ID is not found.", this.StatusCode.HTTP_BAD_REQUEST);
                    }
                    if (job.is_deleted) {
                        throw new customError_1.default("This job has been deleted for some reason.", this.StatusCode.HTTP_BAD_REQUEST);
                    }
                    if (start_time &&
                        end_time &&
                        new Date(start_time) >= new Date(end_time)) {
                        throw new customError_1.default("Job post start time cannot be greater than or equal to end time.", this.StatusCode.HTTP_BAD_REQUEST);
                    }
                    yield model.updateJobPostDetails(Number(id), body.job_post_details);
                }
                if (!hasJobPost && !hasJobPostDetails) {
                    throw new customError_1.default("No values provided to update.", this.StatusCode.HTTP_BAD_REQUEST);
                }
                return {
                    success: true,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    code: this.StatusCode.HTTP_OK,
                };
            }));
        });
    }
    cancelJobPost(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const body = req.body;
                const user = req.hotelier;
                const model = this.Model.jobPostModel(trx);
                const cancellationLogModel = this.Model.cancellationLogModel(trx);
                const jobApplicationModel = this.Model.jobApplicationModel(trx);
                const jobPost = yield model.getSingleJobPostForHotelier(Number(id));
                if (!jobPost) {
                    throw new customError_1.default("Job post not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                if (jobPost.job_post_details_status ===
                    constants_1.JOB_POST_DETAILS_STATUS.Cancelled) {
                    throw new customError_1.default("Job post already cancelled", this.StatusCode.HTTP_BAD_REQUEST);
                }
                const report = yield cancellationLogModel.getSingleCancellationLogWithRelatedId(jobPost.id);
                if (report) {
                    throw new customError_1.default("Conflict: This job post already has an associated cancellation report.", this.StatusCode.HTTP_CONFLICT);
                }
                const currentTime = new Date();
                const startTime = new Date(jobPost.start_time);
                const hoursDiff = (startTime.getTime() - currentTime.getTime()) /
                    (1000 * 60 * 60);
                if (hoursDiff > 24) {
                    yield model.cancelJobPost(Number(jobPost.job_post_id));
                    const vacancy = yield model.getAllJobsUsingJobPostId({
                        id: Number(jobPost.job_post_id),
                    });
                    for (const job of vacancy) {
                        yield model.updateJobPostDetailsStatus({
                            id: Number(job.id),
                            status: constants_1.JOB_POST_DETAILS_STATUS.Cancelled,
                        });
                    }
                    yield jobApplicationModel.cancelApplication(jobPost.job_post_id);
                    return {
                        success: true,
                        message: "Your job post has been successfully cancelled.",
                        code: this.StatusCode.HTTP_OK,
                    };
                }
                else {
                    if (body.report_type !==
                        constants_1.CANCELLATION_REPORT_TYPE.CANCEL_JOB_POST ||
                        !body.reason) {
                        throw new customError_1.default("Invalid request: 'report_type' and 'reason' is required.", this.StatusCode.HTTP_UNPROCESSABLE_ENTITY);
                    }
                    body.reporter_id = user.user_id;
                    body.related_id = id;
                    const cancellationLogModel = this.Model.cancellationLogModel(trx);
                    const data = yield cancellationLogModel.requestForCancellationLog(body);
                    return {
                        success: true,
                        message: this.ResMsg.HTTP_SUCCESSFUL,
                        code: this.StatusCode.HTTP_OK,
                        data: data[0].id,
                    };
                }
            }));
        });
    }
    trackJobSeekerLocation(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { job_seeker } = req.query;
            const model = this.Model.jobApplicationModel();
            const jobPost = yield model.getMyJobApplication({
                job_seeker_id: Number(job_seeker),
                job_application_id: Number(id),
            });
            if (!jobPost) {
                throw new customError_1.default("Job post not found!", this.StatusCode.HTTP_NOT_FOUND);
            }
            const now = new Date();
            const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
            const jobStartTime = new Date(jobPost.start_time);
            if (jobStartTime > twoHoursFromNow || jobStartTime < now) {
                throw new customError_1.default("Live location sharing is only allowed within 2 hours before job start time.", this.StatusCode.HTTP_BAD_REQUEST);
            }
            return {
                success: true,
                message: "Live location sharing is allowed.",
                code: this.StatusCode.HTTP_OK,
            };
        });
    }
}
exports.default = HotelierJobPostService;
