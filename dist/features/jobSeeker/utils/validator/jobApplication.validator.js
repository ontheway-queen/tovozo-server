"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
class JobApplicationValidator {
    constructor() {
        this.createJobApplicationValidator = joi_1.default.object({
            job_post_details_id: joi_1.default.number().integer().required(),
        });
        this.cancellationReportTypeValidator = joi_1.default.object({
            cancellation_report_type: joi_1.default.string()
                .valid(...constants_1.REPORT_TYPE_ENUM)
                .optional(),
        });
        this.cancellationReportReasonValidator = joi_1.default.object({
            report_type: joi_1.default.string()
                .valid(...constants_1.CANCEL_APPLICATION_ENUM)
                .optional(),
            reason: joi_1.default.string().optional(),
        });
    }
}
exports.default = JobApplicationValidator;
