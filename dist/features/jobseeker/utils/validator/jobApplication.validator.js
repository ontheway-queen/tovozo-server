"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class JobApplicationValidator {
    constructor() {
        this.createJobApplicationValidator = joi_1.default.object({
            job_post_details_id: joi_1.default.number().integer().required(),
        });
    }
}
exports.default = JobApplicationValidator;
