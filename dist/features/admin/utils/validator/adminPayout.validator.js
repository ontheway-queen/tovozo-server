"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AdminPayoutValidator {
    constructor() {
        this.managePayout = joi_1.default.object({
            status: joi_1.default.string().valid("Approved", "Rejected").required(),
            admin_note: joi_1.default.string().required(),
            transaction_reference: joi_1.default.string().when("status", {
                is: "Approved",
                then: joi_1.default.string().required().messages({
                    "any.required": `"transaction_reference" is required when status is Approved`,
                    "string.empty": `"transaction_reference" cannot be empty when status is Approved`,
                }),
                otherwise: joi_1.default.string().optional(),
            }),
        });
        this.queryValidator = joi_1.default.object({
            name: joi_1.default.string().optional(),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
        });
    }
}
exports.default = AdminPayoutValidator;
