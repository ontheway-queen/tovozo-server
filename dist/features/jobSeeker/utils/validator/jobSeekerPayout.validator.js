"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class JobSeekerPayoutValidator {
    constructor() {
        this.requestPayoutValidator = joi_1.default.object({
            amount: joi_1.default.number().required(),
            note: joi_1.default.string().required(),
            bank_id: joi_1.default.number().integer().required(),
        });
        this.queryValidator = joi_1.default.object({
            search: joi_1.default.string().optional(),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
        });
    }
}
exports.default = JobSeekerPayoutValidator;
