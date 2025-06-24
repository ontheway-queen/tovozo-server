"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelierJobPostValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
class HotelierJobPostValidator {
    constructor() {
        this.createJobPostSchema = joi_1.default.object({
            job_post: joi_1.default.object({
                title: joi_1.default.string().required(),
                details: joi_1.default.string().optional(),
                created_time: joi_1.default.string().isoDate().optional(),
                expire_time: joi_1.default.string().isoDate().optional(),
                hourly_rate: joi_1.default.number().required(),
                prefer_gender: joi_1.default.string()
                    .valid(...constants_1.GENDERS)
                    .optional(),
                requirements: joi_1.default.string().optional(),
            }).required(),
            job_post_details: joi_1.default.array()
                .items(joi_1.default.object({
                job_id: joi_1.default.number().required(),
                start_time: joi_1.default.string().isoDate().required(),
                end_time: joi_1.default.string().isoDate().required(),
            }))
                .min(1)
                .required(),
        });
        this.getJobPostSchema = joi_1.default.object({
            limit: joi_1.default.number().integer().optional(),
            skip: joi_1.default.number().integer().optional(),
            status: joi_1.default.string()
                .valid("Pending", "Applied", "Expired", "Completed", "Work Finished")
                .optional(),
        });
    }
}
exports.HotelierJobPostValidator = HotelierJobPostValidator;
