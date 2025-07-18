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
                // username: Joi.string().min(1).max(255).required(),
                name: joi_1.default.string().min(1).max(255).required(),
                email: joi_1.default.string().email().lowercase().min(1).max(255).required(),
                password: joi_1.default.string().min(8).max(100).required(),
                phone_number: joi_1.default.string().min(7).max(20).optional(),
            }).required(),
            job_seeker: joi_1.default.object({
                // date_of_birth: Joi.date().required(),
                // gender: Joi.string().valid("Male", "Female", "Other").required(),
                nationality: joi_1.default.number().integer().required(),
                // work_permit: Joi.boolean().required(),
                account_status: joi_1.default.string()
                    .valid(...constants_1.USER_STATUS_ENUM)
                    .default(constants_1.USER_STATUS.PENDING),
                // criminal_convictions: Joi.boolean().required(),
            }).required(),
            passport_copy: joi_1.default.string().max(255).allow("").optional(),
            id_copy: joi_1.default.string().max(255).allow("").optional(),
            visa_copy: joi_1.default.string().max(255).allow("").optional(),
            // own_address: Joi.object({
            //   city_id: Joi.number().integer().required(),
            //   name: Joi.string().max(100).required(),
            //   address: Joi.string().optional(),
            //   longitude: Joi.number().precision(6).optional(),
            //   latitude: Joi.number().precision(6).optional(),
            //   postal_code: Joi.string().max(20).optional(),
            // }).required(),
            // job_preferences: Joi.array().items(Joi.number().integer()).required(),
            // job_shifting: Joi.array()
            //   .items(Joi.string().valid("Morning", "Afternoon", "Night", "Flexible"))
            //   .required(),
            // job_seeker_info: Joi.object({
            //   // hospitality_exp: Joi.boolean().required(),
            //   // languages: Joi.string().allow("").optional(),
            //   // hospitality_certifications: Joi.string().allow("").optional(),
            //   // medical_condition: Joi.string().allow("").optional(),
            //   // dietary_restrictions: Joi.string().allow("").optional(),
            //   // work_start: Joi.string().max(42).allow("").optional(),
            //   // certifications: Joi.string().allow("").optional(),
            //   // reference: Joi.string().allow("").optional(),
            //   // resume: Joi.string().max(255).allow("").optional(),
            //   // training_program_interested: Joi.boolean().required(),
            //   // start_working: Joi.string().max(42).allow("").optional(),
            //   // hours_available: Joi.string().max(42).allow("").optional(),
            //   // comment: Joi.string().allow("").optional(),
            // })
            // .required(),
            // job_locations: Joi.array()
            //   .items(
            //     Joi.object({
            //       city_id: Joi.number().integer().required(),
            //       name: Joi.string().max(100).required(),
            //       address: Joi.string().optional(),
            //       longitude: Joi.number().precision(6).optional(),
            //       latitude: Joi.number().precision(6).optional(),
            //       postal_code: Joi.string().max(20).optional(),
            //     })
            //   )
            //   .min(1)
            //   .required(),
        });
        this.updateJobSeekerValidator = joi_1.default.object({
            user: joi_1.default.object({
                name: joi_1.default.string().min(1).max(255).optional(),
                phone_number: joi_1.default.string().min(7).max(20).optional(),
                photo: joi_1.default.string().max(255).optional(),
            }).optional(),
            own_address: joi_1.default.object({
                id: joi_1.default.number().required(),
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
                account_status: joi_1.default.valid(...Object.values(constants_1.USER_STATUS)).optional(),
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
exports.default = AdminJobSeekerValidator;
