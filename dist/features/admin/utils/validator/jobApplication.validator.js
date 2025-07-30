"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class JobApplicationValidator {
    constructor() {
        this.assignApplication = joi_1.default.object({
            job_post_details_id: joi_1.default.number().required(),
            job_post_id: joi_1.default.number().required(),
            user_id: joi_1.default.number().required(),
        });
        this.getApplicationQuery = joi_1.default.object({
            limit: joi_1.default.number().integer().min(1).default(100).optional(),
            skip: joi_1.default.number().integer().min(0).default(0).optional(),
            status: joi_1.default.string().optional(),
            from_date: joi_1.default.string().isoDate().optional(),
            to_date: joi_1.default.string().isoDate().optional(),
            name: joi_1.default.string().allow("").optional(),
        });
    }
}
exports.default = JobApplicationValidator;
