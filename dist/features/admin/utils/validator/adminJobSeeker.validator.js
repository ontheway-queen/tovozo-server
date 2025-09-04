"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
class AdminJobSeekerValidator {
    constructor() {
        this.getAllJobSeekerSchema = joi_1.default.object({
            name: joi_1.default.string().min(1).max(255).optional().allow(""),
            limit: joi_1.default.number().integer().optional(),
            skip: joi_1.default.number().integer().optional(),
            status: joi_1.default.string()
                .valid(...Object.values(constants_1.USER_STATUS))
                .optional(),
            from_date: joi_1.default.date().optional(),
            to_date: joi_1.default.date().optional(),
            application_status: joi_1.default.string()
                .valid(...constants_1.JOB_APPLICATION_STATUS_ENUM)
                .optional(),
        });
        this.createJobSeekerValidator = joi_1.default.object({
            user: joi_1.default.object({
                name: joi_1.default.string().min(1).max(255).required(),
                email: joi_1.default.string().email().lowercase().min(1).max(255).required(),
                password: joi_1.default.string().min(8).max(100).required(),
                phone_number: joi_1.default.string().min(7).max(20).optional(),
            }).required(),
            job_seeker: joi_1.default.object({
                account_status: joi_1.default.string()
                    .valid(...constants_1.USER_STATUS_ENUM)
                    .default("Pending"),
            }).optional(),
            own_address: joi_1.default.object({
                address: joi_1.default.string().optional(),
                city: joi_1.default.string().max(100).optional(),
                country: joi_1.default.string().max(100).optional(),
                state: joi_1.default.string().max(100).optional(),
                longitude: joi_1.default.number().precision(6).min(-180).max(180).optional(),
                latitude: joi_1.default.number().precision(6).min(-90).max(90).optional(),
                postal_code: joi_1.default.string().optional(),
            }).optional(),
        });
        this.updateJobSeekerValidator = joi_1.default.object({
            user: joi_1.default.object({
                name: joi_1.default.string().min(1).max(255).optional(),
                email: joi_1.default.string().optional(),
                password: joi_1.default.string().optional(),
                phone_number: joi_1.default.string().min(7).max(20).optional(),
            }).optional(),
            own_address: joi_1.default.object({
                city: joi_1.default.string().optional(),
                state: joi_1.default.string().optional(),
                country: joi_1.default.string().optional(),
                name: joi_1.default.string().max(100).optional(),
                address: joi_1.default.string().max(100).optional(),
                longitude: joi_1.default.number().precision(6).optional(),
                latitude: joi_1.default.number().precision(6).optional(),
                postal_code: joi_1.default.string().max(20).optional(),
            }).optional(),
            job_seeker: joi_1.default.object({
                date_of_birth: joi_1.default.date().optional(),
                gender: joi_1.default.string().valid("Male", "Female", "Other").optional(),
                account_status: joi_1.default.valid(...Object.values(constants_1.USER_STATUS)).optional(),
                is_2fa_on: joi_1.default.boolean().optional(),
            }).optional(),
        });
        this.latlonValidator = joi_1.default.object({
            lat: joi_1.default.string(),
            lon: joi_1.default.string(),
            name: joi_1.default.string().allow("").optional(),
        });
    }
}
exports.default = AdminJobSeekerValidator;
