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
                nationality: joi_1.default.string().max(255).optional(),
                address: joi_1.default.string().optional(),
                work_permit: joi_1.default.boolean().optional(),
                criminal_convictions: joi_1.default.boolean().optional(),
                is_2fa_on: joi_1.default.boolean().optional(),
            }).optional(),
            add_job_preferences: joi_1.default.array()
                .items(joi_1.default.number().integer())
                .optional(),
            del_job_preferences: joi_1.default.array()
                .items(joi_1.default.number().integer())
                .optional(),
            delete_job_locations: joi_1.default.array()
                .items(joi_1.default.number().integer())
                .optional(),
            update_job_locations: joi_1.default.array()
                .items(joi_1.default.object({
                id: joi_1.default.number().optional(),
                city_id: joi_1.default.number().integer().optional(),
                name: joi_1.default.string().max(100).optional(),
                address: joi_1.default.string().optional(),
                longitude: joi_1.default.number().precision(6).optional(),
                latitude: joi_1.default.number().precision(6).optional(),
                postal_code: joi_1.default.string().max(20).optional(),
            }))
                .optional(),
            add_job_locations: joi_1.default.array()
                .items(joi_1.default.object({
                id: joi_1.default.number().optional(),
                city_id: joi_1.default.number().integer().optional(),
                name: joi_1.default.string().max(100).optional(),
                address: joi_1.default.string().optional(),
                longitude: joi_1.default.number().precision(6).optional(),
                latitude: joi_1.default.number().precision(6).optional(),
                postal_code: joi_1.default.string().max(20).optional(),
            }))
                .optional(),
            add_job_shifting: joi_1.default.array()
                .items(joi_1.default.string().valid("Morning", "Afternoon", "Night", "Flexible"))
                .optional(),
            del_job_shifting: joi_1.default.array()
                .items(joi_1.default.string().valid("Morning", "Afternoon", "Night", "Flexible"))
                .optional(),
            job_seeker_info: joi_1.default.object({
                hospitality_exp: joi_1.default.boolean().optional(),
                languages: joi_1.default.string().allow("").optional(),
                hospitality_certifications: joi_1.default.string().allow("").optional(),
                medical_condition: joi_1.default.string().allow("").optional(),
                dietary_restrictions: joi_1.default.string().allow("").optional(),
                work_start: joi_1.default.string().max(42).allow("").optional(),
                certifications: joi_1.default.string().allow("").optional(),
                reference: joi_1.default.string().allow("").optional(),
                resume: joi_1.default.string().max(255).allow("").optional(),
                training_program_interested: joi_1.default.boolean().optional(),
                start_working: joi_1.default.string().max(42).allow("").optional(),
                hours_available: joi_1.default.string().max(42).allow("").optional(),
                comment: joi_1.default.string().allow("").optional(),
                passport_copy: joi_1.default.string().max(255).allow("").optional(),
                visa_copy: joi_1.default.string().max(255).allow("").optional(),
            }).optional(),
        });
    }
}
exports.default = JobSeekerProfileUpdate;
