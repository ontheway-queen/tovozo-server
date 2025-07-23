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
const stripe_1 = require("../../../utils/miscellaneous/stripe");
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
const constants_1 = require("../../../utils/miscellaneous/constants");
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
                const loginLink = yield stripe_1.stripe.accounts.createLoginLink("acct_1RnAa4FSzTsJiGrd");
                console.log("Login Link:", loginLink.url);
                // const account = await stripe.accounts.retrieve(
                // 	"acct_1Rmu4JFbg6WrkTSf"
                // );
                // console.log(account?.settings?.payouts?.schedule);
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
                                unit_amount: Math.round(payment.total_amount * 100),
                            },
                            quantity: 1,
                        },
                    ],
                    payment_intent_data: {
                        application_fee_amount: Math.round(payment.platform_fee * 100),
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
                    success_url: `https://tovozo.com/payment/success?session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `https://tovozo.com/payment/cancelled`,
                });
                console.log({ session });
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
                const { user_id } = req.hotelier;
                if (!user_id) {
                    throw new customError_1.default("Hotelier ID is required", this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                }
                if (!sessionId) {
                    throw new customError_1.default("Session ID is required", this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                }
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
                const transactionId = paymentIntentId.slice(-10);
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
                console.log({ 1: payment.status });
                const charge = yield stripe_1.stripe.charges.retrieve(paymentIntent.latest_charge);
                const balanceTransaction = yield stripe_1.stripe.balanceTransactions.retrieve(charge.balance_transaction);
                const stripeFeeInCents = balanceTransaction.fee;
                const paymentPayload = {
                    payment_type: constants_1.PAYMENT_TYPE.ONLINE_PAYMENT,
                    status: constants_1.PAYMENT_STATUS.PAID,
                    trx_id: `TRX-${transactionId}`,
                    paid_at: new Date(),
                    paid_by: organization.id,
                    trx_fee: (stripeFeeInCents / 100).toFixed(2),
                };
                yield paymentModel.updatePayment(Number(paymentIntent.metadata.id), paymentPayload);
                const baseLedgerPayload = {
                    payment_id: payment.id,
                    voucher_no: payment.payment_no,
                    ledger_date: new Date(),
                    created_at: new Date(),
                    updated_at: new Date(),
                    trx_id: `TRX-${transactionId}`,
                };
                yield paymentModel.createPaymentLedger(Object.assign(Object.assign({}, baseLedgerPayload), { user_id: paymentIntent.metadata.job_seeker_id, trx_type: constants_1.PAY_LEDGER_TRX_TYPE.IN, user_type: constants_1.USER_TYPE.JOB_SEEKER, amount: payment.job_seeker_pay, details: `Payment received for job "${paymentIntent.metadata.job_title}".` }));
                yield paymentModel.createPaymentLedger(Object.assign(Object.assign({}, baseLedgerPayload), { trx_type: constants_1.PAY_LEDGER_TRX_TYPE.IN, user_type: constants_1.USER_TYPE.ADMIN, amount: payment.platform_fee, details: `Platform fee received from job "${paymentIntent.metadata.job_title}" completed by ${paymentIntent.metadata.job_seeker_name}` }));
                yield paymentModel.createPaymentLedger(Object.assign(Object.assign({}, baseLedgerPayload), { user_id: user_id, trx_type: constants_1.PAY_LEDGER_TRX_TYPE.OUT, user_type: constants_1.USER_TYPE.HOTELIER, amount: payment.total_amount, details: `Payment sent for job "${paymentIntent.metadata.job_title}" to ${paymentIntent.metadata.job_seeker_name}.` }));
                const updatedApplication = yield jobApplicationModel.updateMyJobApplicationStatus(payment.application_id, Number(paymentIntent.metadata.job_seeker_id), constants_1.JOB_APPLICATION_STATUS.COMPLETED);
                yield jobPostModel.updateJobPostDetailsStatus(updatedApplication.job_post_details_id, constants_1.JOB_POST_DETAILS_STATUS.Completed);
                return {
                    success: true,
                    message: this.ResMsg.HTTP_OK,
                    code: this.StatusCode.HTTP_OK,
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
