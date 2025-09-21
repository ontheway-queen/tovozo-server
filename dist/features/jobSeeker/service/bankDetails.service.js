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
class BankDetailsService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getBankAccounts(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.jobSeeker;
            const { account_number, bank_code, account_name, limit, skip } = req.query;
            const model = this.Model.bankDetailsModel();
            const { data, total } = yield model.getBankAccounts({
                user_id,
                account_number: account_number,
                bank_code: bank_code,
                account_name: account_name,
                limit: Number(limit),
                offset: Number(skip),
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Bank accounts fetched successfully.",
                total,
                data,
            };
        });
    }
    addBankAccounts(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id } = req.jobSeeker;
                const { account_number, bank_code, account_name } = req.body;
                const model = this.Model.bankDetailsModel(trx);
                const { data, total } = yield model.getBankAccounts({
                    user_id,
                    account_number: account_number,
                    bank_code: bank_code,
                    account_name: account_name,
                });
                if (total > 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: this.ResMsg.HTTP_CONFLICT,
                    };
                }
                yield model.addBankDetails({
                    job_seeker_id: user_id,
                    account_name,
                    account_number,
                    bank_code,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Bank account added successfully.",
                };
            }));
        });
    }
    removeBankAccount(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.jobSeeker;
            const id = Number(req.params.id);
            const model = this.Model.bankDetailsModel();
            const { total } = yield model.getBankAccounts({
                user_id,
                id,
            });
            if (total === 0) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: "Bank account not found.",
                };
            }
            yield model.removeBankAccount({ id, user_id });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Bank account delete successfully.",
            };
        });
    }
}
exports.default = BankDetailsService;
