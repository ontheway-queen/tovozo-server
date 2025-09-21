"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class JobSeekerProfileUpdate {
    constructor() {
        this.updateJobSeekerValidator = joi_1.default.object({
            user: joi_1.default.object({
                name: joi_1.default.string().min(1).max(255).optional(),
                phone_number: joi_1.default.string().min(7).max(20).optional(),
                photo: joi_1.default.string().max(255).optional(),
                device_id: joi_1.default.string().optional(),
            }).optional(),
            own_address: joi_1.default.object({
                id: joi_1.default.number().optional(),
                city_id: joi_1.default.number().integer().optional(),
                name: joi_1.default.string().max(100).optional(),
                address: joi_1.default.string().max(100).optional(),
                longitude: joi_1.default.number().precision(6).optional(),
                latitude: joi_1.default.number().precision(6).optional(),
                postal_code: joi_1.default.string().max(20).optional(),
            }).optional(),
            job_seeker: joi_1.default.object({
                date_of_birth: joi_1.default.date().optional(),
                gender: joi_1.default.string().valid("Male", "Female", "Other").optional(),
                address: joi_1.default.string().optional(),
                is_2fa_on: joi_1.default.boolean().optional(),
            }).optional(),
        });
        this.updateUserVerificationDetails = joi_1.default.object({
            bank_details: joi_1.default.object({
                account_name: joi_1.default.string().required(),
                account_number: joi_1.default.string().required(),
                bank_code: joi_1.default.string().required(),
            }).required(),
        });
    }
}
exports.default = JobSeekerProfileUpdate;
