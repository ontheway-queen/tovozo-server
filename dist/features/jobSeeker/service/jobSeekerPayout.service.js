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
class JobSeekerPayoutService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // Make a payout request
    requestForPayout(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id } = req.jobSeeker;
                const { amount, note, bank_id } = req.body;
                const jobseekerModel = this.Model.jobSeekerModel(trx);
                const payoutModel = this.Model.payoutModel(trx);
                const bankDetailsModel = this.Model.bankDetailsModel(trx);
                console.log(1);
                const jobSeeker = yield jobseekerModel.getJobSeekerDetails({
                    user_id,
                });
                const { data: bank_details, total } = yield bankDetailsModel.getBankAccounts({
                    user_id,
                    id: bank_id,
                });
                if (total < 1) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Bank details not found. Please check the account information and try again.",
                    };
                }
                const availableBalance = parseFloat(jobSeeker.available_balance);
                if (amount > availableBalance) {
                    throw new customError_1.default(`Requested amount exceeds your available balance of $${availableBalance}`, this.StatusCode.HTTP_BAD_REQUEST, "ERROR");
                }
                console.log(2);
                const { data } = yield payoutModel.getPayoutsForJobSeeker({
                    user_id,
                    status: "Pending",
                });
                if (data.length > 0) {
                    throw new customError_1.default("You already have a pending payout request. Only one payout request can be made at a time.", this.StatusCode.HTTP_BAD_REQUEST);
                }
                console.log(3);
                const primaryBankAccount = bank_details[0];
                if (!primaryBankAccount) {
                    throw new customError_1.default("Primary bank account is not exists for this user. Please add a primary bank account for payout and then request", this.StatusCode.HTTP_BAD_REQUEST);
                }
                console.log(4);
                const payload = {
                    job_seeker_id: user_id,
                    amount,
                    job_seeker_note: note,
                    bank_account_name: primaryBankAccount.account_name,
                    bank_account_number: primaryBankAccount.account_number,
                    bank_code: primaryBankAccount.bank_code,
                };
                yield payoutModel.createPayout(payload);
                console.log(5);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    getPayoutsForJobSeeker(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.jobSeeker;
            const { search, limit, skip } = req.query;
            const payoutModel = this.Model.payoutModel();
            const { data, total } = yield payoutModel.getPayoutsForJobSeeker({
                search: search,
                limit: Number(limit),
                skip: Number(skip),
                user_id,
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
}
exports.default = JobSeekerPayoutService;
