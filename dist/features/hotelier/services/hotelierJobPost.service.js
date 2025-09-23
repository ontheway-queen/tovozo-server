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
const config_1 = __importDefault(require("../../../app/config"));
const socket_1 = require("../../../app/socket");
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const stripe_1 = require("../../../utils/miscellaneous/stripe");
const commonModelTypes_1 = require("../../../utils/modelTypes/common/commonModelTypes");
const userModelTypes_1 = require("../../../utils/modelTypes/user/userModelTypes");
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
                const unpaidJobs = yield model.getWorkFinishedJobForHotelier({
                    organization_id: checkOrganization.id,
                });
                if (unpaidJobs) {
                    throw new customError_1.default("You have previous unpaid jobs. Please pay them before posting a new job.", this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                }
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
                    const start = new Date(detail.start_time);
                    const end = new Date(detail.end_time);
                    if (start >= end) {
                        throw new customError_1.default("Job post start time cannot be greater than or equal to end time.", this.StatusCode.HTTP_BAD_REQUEST);
                    }
                    const diffInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                    if (diffInHours < 1) {
                        throw new customError_1.default("Job post duration must be at least 1 hour.", this.StatusCode.HTTP_BAD_REQUEST);
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
                const jobpostDetailsId = yield model.createJobPostDetails(jobPostDetails);
                // Job Post Nearby
                const orgLat = parseFloat(checkOrganization.latitude);
                const orgLng = parseFloat(checkOrganization.longitude);
                const all = yield jobSeeker.getJobSeekerLocation({});
                for (const seeker of all) {
                    const isSeekerExists = yield userModel.checkUser({
                        id: seeker.user_id,
                    });
                    if (isSeekerExists && isSeekerExists.length < 1) {
                        continue;
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
                        related_id: jobpostDetailsId[0].id,
                        type: commonModelTypes_1.NotificationTypeEnum.JOB_MATCH,
                    });
                    const isJobSeekerOnline = yield (0, socket_1.getAllOnlineSocketIds)({
                        user_id: seeker.user_id,
                        type: seeker.type,
                    });
                    if (isJobSeekerOnline && isJobSeekerOnline.length > 0) {
                        socket_1.io.to(String(seeker.user_id)).emit(commonModelTypes_1.TypeEmitNotificationEnum.JOB_SEEKER_NEW_NOTIFICATION, {
                            related_id: jobpostDetailsId[0].id,
                            user_id: seeker.user_id,
                            photo: checkOrganization.photo,
                            title: this.NotificationMsg.NEW_JOB_POST_NEARBY
                                .title,
                            content: this.NotificationMsg.NEW_JOB_POST_NEARBY
                                .content,
                            type: commonModelTypes_1.NotificationTypeEnum.JOB_MATCH,
                            read_status: false,
                            created_at: new Date().toISOString(),
                        });
                    }
                    else {
                        if (isSeekerExists[0].device_id) {
                            const pushNotify = yield lib_1.default.sendNotificationToMobile({
                                to: isSeekerExists[0].device_id,
                                notificationTitle: this.NotificationMsg.NEW_JOB_POST_NEARBY.title,
                                notificationBody: this.NotificationMsg.NEW_JOB_POST_NEARBY
                                    .content,
                                // data: JSON.stringify({
                                // 	related_id: jobpostDetailsId[0].id,
                                // 	photo: checkOrganization.photo,
                                // }),
                            });
                            console.log({
                                pushNotify,
                                device_id: isSeekerExists[0].device_id,
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
                var _a, _b;
                const { id } = req.params;
                const body = req.body;
                const { user_id } = req.hotelier;
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
                const endTime = new Date(jobPost.end_time);
                const hourlyRate = jobPost.hourly_rate;
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
                    const diffMs = endTime.getTime() - startTime.getTime();
                    const diffHours = Math.abs(diffMs) / (1000 * 60 * 60);
                    const totalAmount = Number(diffHours) * Number(hourlyRate);
                    const session = yield stripe_1.stripe.checkout.sessions.create({
                        payment_method_types: ["card"],
                        mode: "payment",
                        line_items: [
                            {
                                price_data: {
                                    currency: "usd",
                                    product_data: {
                                        name: `Cancellation Fee for Job #${jobPost.id}`,
                                    },
                                    unit_amount: Math.round(totalAmount * 100),
                                },
                                quantity: 1,
                            },
                        ],
                        payment_intent_data: {
                            metadata: {
                                job_post_details_id: jobPost.id.toString(),
                                job_title: jobPost.title,
                                user_id: user_id.toString(),
                                total_amount: totalAmount.toString(),
                                job_seeker_id: ((_a = jobPost === null || jobPost === void 0 ? void 0 : jobPost.job_seeker_details) === null || _a === void 0 ? void 0 : _a.job_seeker_id) !=
                                    null
                                    ? jobPost.job_seeker_details.job_seeker_id.toString()
                                    : null,
                                job_application_id: ((_b = jobPost === null || jobPost === void 0 ? void 0 : jobPost.job_seeker_details) === null || _b === void 0 ? void 0 : _b.application_id) !==
                                    null
                                    ? jobPost.job_seeker_details.application_id.toString()
                                    : null,
                            },
                        },
                        success_url: `${config_1.default.BASE_URL}/hotelier/job-post/job-cancellation-payment/success?session_id={CHECKOUT_SESSION_ID}`,
                        cancel_url: `${config_1.default.BASE_URL}/hotelier/job-post/job-cancellation-payment/failed`,
                    });
                    return {
                        success: true,
                        message: "To finalize your cancellation, please complete the payment.",
                        code: this.StatusCode.HTTP_OK,
                        data: { url: session.url },
                    };
                }
            }));
        });
    }
    verifyJobCancellationPayment(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const sessionId = req.query.session_id;
                const { user_id, email } = req.hotelier;
                if (!user_id) {
                    throw new customError_1.default("Hotelier ID is required", this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                }
                if (!sessionId) {
                    throw new customError_1.default("Session ID is required", this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                }
                const chatModel = this.Model.chatModel(trx);
                const organizationModel = this.Model.organizationModel(trx);
                const paymentModel = this.Model.paymnentModel(trx);
                const jobApplicationModel = this.Model.jobApplicationModel(trx);
                const jobPostModel = this.Model.jobPostModel(trx);
                const organization = yield organizationModel.getOrganization({
                    user_id,
                });
                if (!organization) {
                    throw new customError_1.default("Organization not found for the provided Hotelier ID", this.StatusCode.HTTP_NOT_FOUND, "ERROR");
                }
                console.log({ organization });
                const session = yield stripe_1.stripe.checkout.sessions.retrieve(sessionId);
                if (!session || session.payment_status !== "paid") {
                    throw new customError_1.default("Payment not completed or session not found", this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                }
                const paymentIntentId = session.payment_intent;
                const paymentIntent = yield stripe_1.stripe.paymentIntents.retrieve(paymentIntentId, {
                    expand: ["charges"],
                });
                console.log({ paymentIntent });
                const baseLedgerPayload = {
                    voucher_no: `CJP-${paymentIntent.metadata.job_post_details_id}`,
                    ledger_date: new Date(),
                    created_at: new Date(),
                    updated_at: new Date(),
                };
                yield paymentModel.createPaymentLedger(Object.assign(Object.assign({}, baseLedgerPayload), { trx_type: constants_1.PAY_LEDGER_TRX_TYPE.IN, user_type: constants_1.USER_TYPE.ADMIN, amount: Number(paymentIntent.metadata.total_amount), entry_type: constants_1.PAYMENT_ENTRY_TYPE.INVOICE, details: `Cancellation fee of amount ${Number(paymentIntent.metadata.total_amount) / 100} for job '${paymentIntent.metadata.job_title}' requested by ${organization.name} has been collected.` }));
                yield paymentModel.createPaymentLedger(Object.assign(Object.assign({}, baseLedgerPayload), { user_id: user_id, trx_type: constants_1.PAY_LEDGER_TRX_TYPE.OUT, user_type: constants_1.USER_TYPE.HOTELIER, entry_type: constants_1.PAYMENT_ENTRY_TYPE.INVOICE, amount: Number(paymentIntent.metadata.total_amount), details: `You have successfully paid a cancellation fee of amount ${Number(paymentIntent.metadata.total_amount).toFixed(2)} for the job '${paymentIntent.metadata.job_title}'.` }));
                const model = this.Model.jobPostModel(trx);
                const check = yield model.getSingleJobPostForHotelier(Number(paymentIntent.metadata.job_post_details_id));
                if (!check) {
                    throw new customError_1.default("Job post not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                console.log({ check });
                const notCancellableStatuses = [
                    "Work Finished",
                    "Complete",
                    "Cancelled",
                ];
                if (notCancellableStatuses.includes(check.job_post_details_status)) {
                    throw new customError_1.default(`Can't cancel. This job post is already ${check.job_post_details_status.toLowerCase()}.`, this.StatusCode.HTTP_BAD_REQUEST);
                }
                yield model.updateJobPostDetailsStatus({
                    id: Number(paymentIntent.metadata.job_post_details_id),
                    status: "Cancelled",
                });
                if (paymentIntent.metadata.job_seeker_id) {
                    const chatSession = yield chatModel.getChatSessionBetweenUsers({
                        hotelier_id: user_id,
                        job_seeker_id: Number(paymentIntent.metadata.job_seeker_id),
                    });
                    if (chatSession) {
                        yield chatModel.updateChatSession({
                            session_id: chatSession.id,
                            payload: {
                                enable_chat: false,
                            },
                        });
                    }
                    yield jobApplicationModel.updateMyJobApplicationStatus({
                        application_id: Number(paymentIntent.metadata.job_application_id),
                        job_seeker_id: Number(paymentIntent.metadata.job_seeker_id),
                        status: "Cancelled",
                    });
                }
                yield this.insertNotification(trx, userModelTypes_1.TypeUser.ADMIN, {
                    user_id: user_id,
                    sender_type: constants_1.USER_TYPE.HOTELIER,
                    title: "Payment Received for job post cancellation",
                    content: `Cancellation fee of amount ${Number(paymentIntent.metadata.total_amount) / 100} for job '${paymentIntent.metadata.job_title}' requested by ${organization.name} has been collected.`,
                    related_id: Number(paymentIntent.metadata.job_post_details_id),
                    type: commonModelTypes_1.NotificationTypeEnum.PAYMENT,
                });
                yield this.insertNotification(trx, constants_1.USER_TYPE.HOTELIER, {
                    title: "Payment done for job post cancellation",
                    content: `You have successfully paid a cancellation fee of amount ${Number(paymentIntent.metadata.total_amount).toFixed(2)} for the job '${paymentIntent.metadata.job_title}'.`,
                    related_id: Number(paymentIntent.metadata.job_post_details_id),
                    sender_type: constants_1.USER_TYPE.ADMIN,
                    user_id: user_id,
                    type: commonModelTypes_1.NotificationTypeEnum.PAYMENT,
                });
                return {
                    success: true,
                    message: this.ResMsg.HTTP_OK,
                    code: this.StatusCode.HTTP_OK,
                };
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
