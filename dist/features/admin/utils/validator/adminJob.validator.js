"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
class AdminJobValidator {
    constructor() {
        this.createJobSchema = joi_1.default.object({
            title: joi_1.default.string().min(1).max(255).required(),
            description: joi_1.default.string().optional(),
        });
        this.updateJobSchema = joi_1.default.object({
            title: joi_1.default.string().min(1).max(255).optional(),
            description: joi_1.default.string().optional(),
            status: joi_1.default.boolean().optional(),
        });
        this.getAllJobSchema = joi_1.default.object({
            title: joi_1.default.string().min(1).max(255).optional(),
            status: joi_1.default.boolean().optional(),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            orderBy: joi_1.default.string().valid("title").optional(),
            orderTo: joi_1.default.string().valid("asc", "desc").optional(),
        });
        this.cancellationReportSchema = joi_1.default.object({
            status: joi_1.default.string().valid(...constants_1.CANCELLATION_REPORT_STATUS_ENUM),
            reject_reason: joi_1.default.string().optional(),
        });
    }
}
exports.default = AdminJobValidator;
