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
class StripeService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createPayment(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const userModel = this.Model.UserModel(trx);
            }));
        });
    }
    onboardComplete(req) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({ req });
            const { user_id } = req.admin;
            const stripe_acc_id = req.query.stripe_acc_id;
            if (!stripe_acc_id) {
                throw new Error("Stripe account ID is required");
            }
            const account = yield stripe_1.stripe.accounts.retrieve(stripe_acc_id);
            console.log({ account });
            if (!account.payouts_enabled) {
                // 🔥 Delete the Stripe account from Connect dashboard
                yield stripe_1.stripe.accounts.del(stripe_acc_id);
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Stripe account not eligible. Account has been deleted.",
                };
            }
            // ✅ Save if verified
            yield this.Model.UserModel().addStripePayoutAccount({
                user_id,
                stripe_acc_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: { message: "Onboarding completed successfully" },
            };
        });
    }
}
exports.default = StripeService;
