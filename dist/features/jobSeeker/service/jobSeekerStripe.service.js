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
const config_1 = __importDefault(require("../../../app/config"));
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
class JobSeekerStripeService extends abstract_service_1.default {
    constructor() {
        super();
    }
    addStripePayoutAccount(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id } = req.jobSeeker;
                const { email, country } = req.body;
                const userModel = this.Model.UserModel(trx);
                const user = yield userModel.checkUser({ id: user_id });
                if (!user || user.length === 0) {
                    throw new customError_1.default("User not found", this.StatusCode.HTTP_NOT_FOUND);
                }
                console.log({ user });
                if (user[0].stripe_acc_id) {
                    throw new customError_1.default("Stripe account already exists for this user", this.StatusCode.HTTP_BAD_REQUEST);
                }
                const fullName = user[0].name.trim().split(" ");
                const first_name = fullName[0];
                const last_name = fullName.slice(1).join(" ");
                const account = yield stripe_1.stripe.accounts.create({
                    type: "express",
                    country,
                    email,
                    business_type: "individual",
                    capabilities: {
                        card_payments: { requested: true },
                        transfers: { requested: true },
                    },
                    individual: {
                        first_name,
                        last_name,
                    },
                });
                console.log({ account });
                const accountLink = yield stripe_1.stripe.accountLinks.create({
                    account: account.id,
                    refresh_url: `${config_1.default.BASE_URL}/job-seeker/stripe/onboard/refresh`,
                    return_url: `${config_1.default.BASE_URL}/job-seeker/stripe/onboard/complete?stripe_acc_id=${account.id}`,
                    type: "account_onboarding",
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: { url: accountLink.url },
                };
            }));
        });
    }
    onboardComplete(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.jobSeeker;
            const stripe_acc_id = req.query.stripe_acc_id;
            if (!stripe_acc_id) {
                throw new Error("Stripe account ID is required");
            }
            const account = yield stripe_1.stripe.accounts.retrieve(stripe_acc_id);
            console.log({ account });
            if (!account.payouts_enabled) {
                yield stripe_1.stripe.accounts.del(stripe_acc_id);
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Stripe account not eligible. Account has been deleted. Please onboard again.",
                };
            }
            yield this.Model.jobSeekerModel().addStripePayoutAccount({
                user_id,
                stripe_acc_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Onboarding completed successfully",
            };
        });
    }
    loginStripeAccount(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.jobSeeker;
            const userModel = this.Model.UserModel();
            const jobSeekerModel = this.Model.jobSeekerModel();
            const checkUser = yield userModel.checkUser({ id: user_id });
            if (checkUser.length < 1) {
                throw new customError_1.default("User not found!", this.StatusCode.HTTP_NOT_FOUND);
            }
            const jobSeeker = yield jobSeekerModel.getJobSeekerDetails({ user_id });
            if (!jobSeeker) {
                throw new customError_1.default("Job seeker not found", this.StatusCode.HTTP_NOT_FOUND);
            }
            // if (!jobSeeker.stripe_acc_id) {
            // 	throw new Error(
            // 		"Stripe Account not found. Please complete your profile first!"
            // 	);
            // }
            const loginLink = yield stripe_1.stripe.accounts.createLoginLink(jobSeeker.stripe_acc_id || "acct_1RnAa4FSzTsJiGrd");
            return {
                success: true,
                message: this.ResMsg.HTTP_OK,
                code: this.StatusCode.HTTP_OK,
                data: {
                    url: loginLink.url,
                },
            };
        });
    }
}
exports.default = JobSeekerStripeService;
