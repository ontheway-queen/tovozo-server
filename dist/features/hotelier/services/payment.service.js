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
<<<<<<< HEAD
const constants_1 = require("../../../utils/miscellaneous/constants");
const stripe_1 = require("../../../utils/miscellaneous/stripe");
const commonModelTypes_1 = require("../../../utils/modelTypes/common/commonModelTypes");
const userModelTypes_1 = require("../../../utils/modelTypes/user/userModelTypes");
=======
const dayjs_1 = __importDefault(require("dayjs"));
const invoiceTemplate_1 = require("../../../utils/templates/invoiceTemplate");
>>>>>>> 5e06b241ed0e142f638ced6b9ac8aab7cb7ad313
class PaymentService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getPaymentsForHotelier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, search, status } = req.query;
            const { user_id } = req.hotelier;
            const params = {
                hotelier_id: user_id,
                limit: Number(limit) || 100,
                skip: Number(skip) || 0,
                search: search ? String(search) : "",
                status: status ? String(status) : undefined,
            };
            const paymentModel = this.Model.paymnentModel();
            const { data, total } = yield paymentModel.getPaymentsForHotelier(params);
            return {
                success: true,
                message: this.ResMsg.HTTP_OK,
                code: this.StatusCode.HTTP_OK,
                data,
                total,
            };
        });
    }
    getSinglePaymentForHotelier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.hotelier;
            const id = req.params.id;
            const model = this.Model.paymnentModel();
            const data = yield model.getSinglePaymentForHotelier(Number(id), user_id);
            if (!data) {
                throw new customError_1.default("The requested pay slip not found", this.StatusCode.HTTP_NOT_FOUND);
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
            };
        });
    }
    createCheckoutSession(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { job_title, job_seeker_id, job_seeker_name, stripe_acc_id } = req.body;
                const id = Number(req.params.id);
                const { user_id } = req.hotelier;
                if (!id) {
                    throw new customError_1.default("Id not found", this.StatusCode.HTTP_NOT_FOUND);
                }
                const paymentModel = this.Model.paymnentModel();
                const payment = yield paymentModel.getSinglePayment(id);
                if (!payment) {
                    throw new customError_1.default("Payment record not found", this.StatusCode.HTTP_NOT_FOUND, "ERROR");
                }
                if (payment.status === constants_1.PAYMENT_STATUS.PAID) {
                    throw new customError_1.default("The payment is already paid", this.StatusCode.HTTP_CONFLICT);
                }
                const total_amount = Number(payment.total_amount);
                const jobSeekerPay = Number(payment.job_seeker_pay);
                const applicationFeeAmount = total_amount - jobSeekerPay;
                const session = yield stripe_1.stripe.checkout.sessions.create({
                    payment_method_types: ["card"],
                    mode: "payment",
                    line_items: [
                        {
                            price_data: {
                                currency: "usd",
                                product_data: {
                                    name: `Payment for ${job_title} by ${job_seeker_name}`,
                                },
                                unit_amount: Math.round(total_amount * 100),
                            },
                            quantity: 1,
                        },
                    ],
                    payment_intent_data: {
                        application_fee_amount: Math.round(applicationFeeAmount * 100),
                        transfer_data: {
                            destination: stripe_acc_id,
                        },
                        metadata: {
                            id,
                            job_seeker_id,
                            job_title,
                            job_seeker_name,
                            paid_by: user_id,
                        },
                    },
                    success_url: `${config_1.default.BASE_URL}/hotelier/payment/verify-checkout-session?session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${config_1.default.BASE_URL}/hotelier/payment/cancelled`,
                });
                return {
                    success: true,
                    message: this.ResMsg.HTTP_OK,
                    code: this.StatusCode.HTTP_OK,
                    data: { url: session.url },
                };
            }
            catch (error) {
                throw new customError_1.default(error instanceof Error && error.message
                    ? error.message
                    : "An error occurred while creating the checkout session", this.StatusCode.HTTP_INTERNAL_SERVER_ERROR, "ERROR");
            }
        });
    }
    verifyCheckoutSession(req) {
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
                const session = yield stripe_1.stripe.checkout.sessions.retrieve(sessionId);
                if (!session || session.payment_status !== "paid") {
                    throw new customError_1.default("Payment not completed or session not found", this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                }
                const paymentIntentId = session.payment_intent;
                const paymentIntent = yield stripe_1.stripe.paymentIntents.retrieve(paymentIntentId, {
                    expand: ["charges"],
                });
                const payment = yield paymentModel.getSinglePayment(Number(paymentIntent.metadata.id));
                if (!payment) {
                    throw new customError_1.default("Payment record not found", this.StatusCode.HTTP_NOT_FOUND, "ERROR");
                }
                if (payment.status === "paid") {
                    throw new customError_1.default("The payment is aleady paid", this.StatusCode.HTTP_CONFLICT);
                }
                const jobseeker = yield this.Model.UserModel().checkUser({
                    id: Number(paymentIntent.metadata.job_seeker_id),
                });
                if (jobseeker && jobseeker.length < 1) {
                    throw new customError_1.default("User not found", this.StatusCode.HTTP_NOT_FOUND);
                }
                const paymentPayload = {
                    payment_type: constants_1.PAYMENT_TYPE.ONLINE_PAYMENT,
                    status: constants_1.PAYMENT_STATUS.PAID,
                    trx_id: paymentIntent.id,
                    paid_at: new Date(),
                    paid_by: organization.id,
                };
                yield paymentModel.updatePayment(Number(paymentIntent.metadata.id), paymentPayload);
                const baseLedgerPayload = {
                    payment_id: payment.id,
                    voucher_no: payment.payment_no,
                    ledger_date: new Date(),
                    created_at: new Date(),
                    updated_at: new Date(),
                };
                yield paymentModel.createPaymentLedger(Object.assign(Object.assign({}, baseLedgerPayload), { user_id: paymentIntent.metadata.job_seeker_id, trx_type: constants_1.PAY_LEDGER_TRX_TYPE.IN, user_type: constants_1.USER_TYPE.JOB_SEEKER, amount: payment.job_seeker_pay, details: `Payment received for job "${paymentIntent.metadata.job_title}".` }));
                yield paymentModel.createPaymentLedger(Object.assign(Object.assign({}, baseLedgerPayload), { trx_type: constants_1.PAY_LEDGER_TRX_TYPE.IN, user_type: constants_1.USER_TYPE.ADMIN, amount: payment.platform_fee, details: `Platform fee received from job "${paymentIntent.metadata.job_title}" completed by ${paymentIntent.metadata.job_seeker_name}` }));
                yield paymentModel.createPaymentLedger(Object.assign(Object.assign({}, baseLedgerPayload), { user_id: user_id, trx_type: constants_1.PAY_LEDGER_TRX_TYPE.OUT, user_type: constants_1.USER_TYPE.HOTELIER, amount: payment.total_amount, details: `Payment sent for job "${paymentIntent.metadata.job_title}" to ${paymentIntent.metadata.job_seeker_name}.` }));
                const updatedApplication = yield jobApplicationModel.updateMyJobApplicationStatus({
                    application_id: payment.application_id,
                    job_seeker_id: Number(paymentIntent.metadata.job_seeker_id),
                    status: constants_1.JOB_APPLICATION_STATUS.COMPLETED,
                });
                const jobPost = yield jobPostModel.updateJobPostDetailsStatus({
                    id: updatedApplication.job_post_details_id,
                    status: constants_1.JOB_POST_DETAILS_STATUS.Completed,
                });
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
                yield this.insertNotification(trx, userModelTypes_1.TypeUser.JOB_SEEKER, {
                    user_id: Number(paymentIntent.metadata.job_seeker_id),
                    sender_id: user_id,
                    sender_type: constants_1.USER_TYPE.HOTELIER,
                    title: this.NotificationMsg.PAYMENT_RECEIVED.title,
                    content: this.NotificationMsg.PAYMENT_RECEIVED.content({
                        jobTitle: paymentIntent.metadata.job_title,
                        amount: Number(payment.job_seeker_pay),
                    }),
                    related_id: payment.id,
                    type: commonModelTypes_1.NotificationTypeEnum.PAYMENT,
                });
                yield this.insertNotification(trx, userModelTypes_1.TypeUser.ADMIN, {
                    user_id: Number(paymentIntent.metadata.job_seeker_id),
                    sender_type: constants_1.USER_TYPE.HOTELIER,
                    title: this.NotificationMsg.PAYMENT_RECEIVED.title,
                    content: this.NotificationMsg.PAYMENT_RECEIVED.content({
                        jobTitle: paymentIntent.metadata.job_title,
                        amount: Number(payment.platform_fee),
                    }),
                    related_id: payment.id,
                    type: commonModelTypes_1.NotificationTypeEnum.PAYMENT,
                });
                const isJobSeekerOnline = yield (0, socket_1.getAllOnlineSocketIds)({
                    user_id: Number(paymentIntent.metadata.job_seeker_id),
                    type: userModelTypes_1.TypeUser.JOB_SEEKER,
                });
                if (isJobSeekerOnline && isJobSeekerOnline.length > 0) {
                    socket_1.io.to(paymentIntent.metadata.job_seeker_id).emit(commonModelTypes_1.TypeEmitNotificationEnum.JOB_SEEKER_NEW_NOTIFICATION, {
                        user_id: Number(paymentIntent.metadata.job_seeker_id),
                        sender_id: user_id,
                        sender_type: constants_1.USER_TYPE.HOTELIER,
                        title: this.NotificationMsg.PAYMENT_RECEIVED.title,
                        content: this.NotificationMsg.PAYMENT_RECEIVED.content({
                            jobTitle: paymentIntent.metadata.job_title,
                            amount: Number(payment.job_seeker_pay),
                        }),
                        related_id: payment.id,
                        type: commonModelTypes_1.NotificationTypeEnum.PAYMENT,
                    });
                }
                else {
                    if (jobseeker[0].device_id) {
                        yield lib_1.default.sendNotificationToMobile({
                            to: jobseeker[0].device_id,
                            notificationTitle: this.NotificationMsg.PAYMENT_RECEIVED.title,
                            notificationBody: this.NotificationMsg.PAYMENT_RECEIVED.content({
                                jobTitle: paymentIntent.metadata.job_title,
                                amount: Number(payment.job_seeker_pay),
                            }),
                        });
                    }
                }
                // pdf for hotelier
                const hotelierPdfBuffer = yield lib_1.default.generateHtmlToPdfBuffer((0, invoiceTemplate_1.hotelierInvoiceTemplate)({
                    to: email,
                    address: organization.address,
                    invoice_no: payment.payment_no,
                    date: (0, dayjs_1.default)().format("DD/MM/YYYY"),
                    amount: payment.total_amount,
                    customer: organization.name,
                    authorize: "TOVOZO",
                }));
                yield lib_1.default.sendEmailDefault({
                    email,
                    emailSub: `Invoice ${payment.payment_no} for Job ${jobPost[0].job_post_title} - ${new Date().toLocaleDateString()}`,
                    emailBody: `Attached is your invoice ${payment.payment_no} for the job "${jobPost[0].job_post_title}".
Total Amount: $${payment.total_amount}.`,
                    attachments: [
                        {
                            filename: `${payment.payment_no}.pdf`,
                            content: hotelierPdfBuffer,
                            contentType: "application/pdf",
                        },
                    ],
                });
                console.log({ jobseeker });
                // pdf for job seeker
                const jobseekerPdfBuffer = yield lib_1.default.generateHtmlToPdfBuffer((0, invoiceTemplate_1.jobSeekerInvoiceTemplate)({
                    to: "mehedihassan.m360ict@gmail.com",
                    address: "This is test job seeker address",
                    invoice_no: payment.payment_no,
                    date: (0, dayjs_1.default)().format("DD/MM/YYYY"),
                    amount: payment.job_seeker_pay,
                    customer: jobseeker[0].name,
                    authorize: "TOVOZO",
                }));
                yield lib_1.default.sendEmailDefault({
                    email: "mehedihassan.m360ict@gmail.com",
                    emailSub: `Invoice ${payment.payment_no} for Job ${jobPost[0].job_post_title} - ${new Date().toLocaleDateString()}`,
                    emailBody: `Attached is your invoice ${payment.payment_no} for the job "${jobPost[0].job_post_title}".
Total Amount: $${payment.job_seeker_pay}.`,
                    attachments: [
                        {
                            filename: `${payment.payment_no}.pdf`,
                            content: jobseekerPdfBuffer,
                            contentType: "application/pdf",
                        },
                    ],
                });
                return {
                    success: true,
                    message: this.ResMsg.HTTP_OK,
                    code: this.StatusCode.HTTP_OK,
                    data: {
                        trx_id: paymentIntent.id,
                        paid_at: new Date(),
                        status: constants_1.PAYMENT_STATUS.PAID,
                        total: payment.total_amount,
                        job_seeker_name: paymentIntent.metadata.job_seeker_name,
                        job_title: paymentIntent.metadata.job_title,
                    },
                };
            }));
        });
    }
    // Ledger
    getAllPaymentLedgerForHotelier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, search } = req.query;
            const { user_id } = req.hotelier;
            const paymentModel = this.Model.paymnentModel();
            const { data, total } = yield paymentModel.getAllPaymentLedgerForHotelier({
                limit: Number(limit) || 100,
                skip: Number(skip) || 0,
                search: search ? String(search) : "",
                user_id,
            });
            return {
                success: true,
                message: this.ResMsg.HTTP_OK,
                code: this.StatusCode.HTTP_OK,
                data,
                total,
            };
        });
    }
}
exports.default = PaymentService;
