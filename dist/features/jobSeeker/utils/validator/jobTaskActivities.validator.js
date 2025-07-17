"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class JobTaskActivitiesValidator {
    constructor() {
        this.createJobTaskActivity = joi_1.default.object({
            job_application_id: joi_1.default.number().required(),
            job_post_details_id: joi_1.default.number().required(),
        });
    }
}
exports.default = JobTaskActivitiesValidator;
