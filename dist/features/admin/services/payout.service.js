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
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const commonModelTypes_1 = require("../../../utils/modelTypes/common/commonModelTypes");
const userModelTypes_1 = require("../../../utils/modelTypes/user/userModelTypes");
class AdminPayoutService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getAllPayouts(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { search, limit, skip } = req.query;
            const payoutModel = this.Model.payoutModel();
            const { data, total } = yield payoutModel.getAllPayoutForAdmin({
                search: search,
                limit: Number(limit),
                skip: Number(skip),
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                total,
                data,
            };
        });
    }
    getSinglePayout(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            console.log({ id });
            const payoutModel = this.Model.payoutModel();
            const data = yield payoutModel.getSinglePayout({
                id,
            });
            if (!data) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
            };
        });
    }
    managePayout(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { user_id: adminUserId } = req.admin;
                const id = Number(req.params.id);
                const body = req.body;
                const payoutModel = this.Model.payoutModel(trx);
                const paymentModel = this.Model.paymnentModel(trx);
                const payout = yield payoutModel.getSinglePayout({ id });
                if (!payout) {
                    throw new customError_1.default("Payout request not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                const payload = Object.assign(Object.assign({}, body), { managed_at: new Date(), managed_by: adminUserId });
                yield payoutModel.managePayout({ id: id, payload });
                const baseLedgerPayload = {
                    related_id: id,
                    voucher_no: `TVZ-WD-${Date.now()}`,
                    ledger_date: new Date(),
                    created_at: new Date(),
                    updated_at: new Date(),
                };
                yield paymentModel.createPaymentLedger(Object.assign(Object.assign({}, baseLedgerPayload), { user_id: payout.job_seeker_id, trx_type: constants_1.PAY_LEDGER_TRX_TYPE.OUT, entry_type: constants_1.PAYMENT_ENTRY_TYPE.WITHDRAW, user_type: constants_1.USER_TYPE.JOB_SEEKER, amount: Number(payout.amount), details: `Withdrawal of ${payout.amount} processed successfully.` }));
                // 🔹 Insert audit log
                yield this.insertAdminAudit(trx, {
                    created_by: adminUserId,
                    type: "UPDATE",
                    endpoint: `${req.method} ${req.originalUrl}`,
                    details: body.status === "Approved"
                        ? `Admin ${adminUserId} approved payout #${id} with transaction reference ${body.transaction_reference}`
                        : `Admin ${adminUserId} ${body.status.toLowerCase()} payout #${id}`,
                    payload: JSON.stringify(payload),
                });
                // 🔹 Build notification for jobseeker
                const jobSeekerId = payout.job_seeker_id;
                const notificationTitle = body.status === "Approved"
                    ? "Your payout request has been approved 🎉"
                    : "Your payout request has been rejected ❌";
                const notificationContent = body.status === "Approved"
                    ? `Your payout request #${id} has been approved. Transaction Ref: ${body.transaction_reference}`
                    : `Your payout request #${id} has been rejected. Please check admin note for details.`;
                yield this.insertNotification(trx, constants_1.USER_TYPE.JOB_SEEKER, {
                    title: notificationTitle,
                    content: notificationContent,
                    related_id: id,
                    sender_type: constants_1.USER_TYPE.ADMIN,
                    sender_id: adminUserId,
                    user_id: jobSeekerId,
                    type: commonModelTypes_1.NotificationTypeEnum.PAYMENT,
                });
                const isJobSeekerOnline = yield (0, socket_1.getAllOnlineSocketIds)({
                    user_id: jobSeekerId,
                    type: userModelTypes_1.TypeUser.JOB_SEEKER,
                });
                if (isJobSeekerOnline && isJobSeekerOnline.length > 0) {
                    socket_1.io.to(String(jobSeekerId)).emit(commonModelTypes_1.TypeEmitNotificationEnum.JOB_SEEKER_NEW_NOTIFICATION, {
                        user_id: jobSeekerId,
                        title: notificationTitle,
                        content: notificationContent,
                        related_id: id,
                        type: commonModelTypes_1.NotificationTypeEnum.PAYOUT,
                        read_status: false,
                        created_at: new Date().toISOString(),
                    });
                }
                else {
                    const isJobSeekerExists = yield this.Model.UserModel().checkUser({ id: jobSeekerId });
                    if ((_a = isJobSeekerExists[0]) === null || _a === void 0 ? void 0 : _a.device_id) {
                        yield lib_1.default.sendNotificationToMobile({
                            to: isJobSeekerExists[0].device_id,
                            notificationTitle: notificationTitle,
                            notificationBody: notificationContent,
                            // data: JSON.stringify({
                            // 	related_id: id,
                            // }),
                        });
                    }
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
}
exports.default = AdminPayoutService;
