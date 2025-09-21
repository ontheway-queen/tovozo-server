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
                expire_time: joi_1.default.string()
                    .isoDate()
                    .required()
                    .custom((value, helpers) => {
                    const expireDate = new Date(value);
                    if (expireDate <= new Date()) {
                        return helpers.error("any.custom", {
                            message: "Expire time must be a future date and time.",
                        });
                    }
                    return value;
                })
                    .messages({
                    "string.isoDate": "Expire time must be a valid ISO date.",
                    "any.required": "Expire time is required.",
                    "any.custom": "{{#message}}",
                }),
            }).required(),
            job_post_details: joi_1.default.array()
                .items(joi_1.default.object({
                job_id: joi_1.default.number().required().messages({
                    "number.base": "Job ID must be a number.",
                    "any.required": "Job ID is required.",
                }),
                start_time: joi_1.default.string()
                    .isoDate()
                    .required()
                    .custom((value, helpers) => {
                    // const startTime = new Date(value);
                    // const nowPlus24h = new Date(
                    // 	Date.now() + 24 * 60 * 60 * 1000
                    // );
                    // if (startTime < nowPlus24h) {
                    // 	return helpers.error("any.custom", {
                    // 		message:
                    // 			"Start time must be at least 24 hours from now.",
                    // 	});
                    // }
                    return value;
                })
                    .messages({
                    "string.isoDate": "Start time must be a valid ISO date.",
                    "any.required": "Start time is required.",
                    "any.custom": "{{#message}}",
                }),
                end_time: joi_1.default.string().isoDate().required().messages({
                    "string.isoDate": "End time must be a valid ISO date.",
                    "any.required": "End time is required.",
                }),
            }))
                .min(1)
                .required(),
        })
            .custom((obj, helpers) => {
            const expireTime = new Date(obj.job_post.expire_time);
            for (const detail of obj.job_post_details) {
                const startTime = new Date(detail.start_time);
                if (startTime < expireTime) {
                    return helpers.error("any.custom", {
                        message: "Start time must be after expire time.",
                    });
                }
            }
            return obj;
        })
            .messages({
            "any.custom": "{{#message}}",
        });
        this.getJobPostSchema = joi_1.default.object({
            limit: joi_1.default.number().integer().optional(),
            skip: joi_1.default.number().integer().optional(),
            status: joi_1.default.string()
                .valid(...constants_1.JOB_POST_DETAILS_STATUS_ENUM)
                .optional(),
            name: joi_1.default.string().allow("").optional(),
            title: joi_1.default.string().optional(),
            from_date: joi_1.default.string().optional(),
            to_date: joi_1.default.string().optional(),
        });
        this.getSingleJobPostSchema = joi_1.default.object({
            id: joi_1.default.number().integer().required(),
        }).required();
        this.cancelJobPostSchema = joi_1.default.object({
            related_id: joi_1.default.number().integer(),
            report_type: joi_1.default.string().valid(...constants_1.CANCEL_JOB_POST_ENUM),
            reason: joi_1.default.string(),
        });
        this.updateJobPostSchema = joi_1.default.object({
            job_post: joi_1.default.object({
                title: joi_1.default.string().optional(),
                details: joi_1.default.string().optional(),
                expire_time: joi_1.default.string().isoDate().optional(),
                hourly_rate: joi_1.default.number().optional(),
                prefer_gender: joi_1.default.string()
                    .valid(...constants_1.GENDERS)
                    .optional(),
                requirements: joi_1.default.string().optional(),
            }).required(),
            job_post_details: joi_1.default.object({
                job_id: joi_1.default.number().optional(),
                start_time: joi_1.default.string().isoDate().optional(),
                end_time: joi_1.default.string().isoDate().optional(),
            }).optional(),
        });
        this.trackJobSeekerLocationSchema = joi_1.default.object({
            job_seeker: joi_1.default.number().integer().required(),
        });
    }
}
exports.HotelierJobPostValidator = HotelierJobPostValidator;
