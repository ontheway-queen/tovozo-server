"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class BankDetailsValidator {
    constructor() {
        this.getBankDetailsQueryValidator = joi_1.default.object({
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            account_number: joi_1.default.string().optional(),
            bank_code: joi_1.default.string().optional(),
            account_name: joi_1.default.string().optional(),
            id: joi_1.default.number().optional(),
        });
        this.addBankDetailsPayloadValidator = joi_1.default.object({
            account_number: joi_1.default.string().required(),
            bank_code: joi_1.default.string().required(),
            account_name: joi_1.default.string().required(),
        });
    }
}
exports.default = BankDetailsValidator;
