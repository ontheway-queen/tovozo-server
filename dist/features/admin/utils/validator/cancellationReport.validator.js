"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
class CancellationReportValidator {
    constructor() {
        this.cancellationReportSchema = joi_1.default.object({
            status: joi_1.default.string().valid(...constants_1.CANCELLATION_REPORT_STATUS_ENUM),
            reject_reason: joi_1.default.string().when("status", {
                is: constants_1.CANCELLATION_REPORT_STATUS.REJECTED,
                then: joi_1.default.required().messages({
                    "any.required": "Rejected reason is required when status is REJECTED.",
                }),
                otherwise: joi_1.default.forbidden(),
            }),
        });
        this.reportQuerySchema = joi_1.default.object({
            user_id: joi_1.default.number().optional(),
            report_type: joi_1.default.string()
                .valid(...constants_1.CANCELLATION_REPORT_TYPE_ENUM)
                .optional(),
            status: joi_1.default.string()
                .valid(...constants_1.CANCELLATION_REPORT_STATUS_ENUM)
                .optional(),
            limit: joi_1.default.number().integer().min(1).max(1000).optional(),
            skip: joi_1.default.number().integer().min(0).optional(),
            searchQuery: joi_1.default.string().allow("").optional(),
            name: joi_1.default.string().allow("").optional(),
        });
        this.reportTypeQuerySchema = joi_1.default.object({
            report_type: joi_1.default.string()
                .valid(...constants_1.CANCELLATION_REPORT_TYPE_ENUM)
                .required(),
        });
    }
}
exports.default = CancellationReportValidator;
