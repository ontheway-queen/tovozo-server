"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
const validatorConstant_1 = require("./validatorConstant");
class PublicCommonValidator {
    constructor() {
        this.singleParamNumValidator = (idFieldName = "id") => {
            const schemaObject = {};
            schemaObject[idFieldName] = joi_1.default.number().required();
            return joi_1.default.object(schemaObject);
        };
        // single param string validator
        this.singleParamStringValidator = (idFieldName = "id") => {
            const schemaObject = {};
            schemaObject[idFieldName] = joi_1.default.string().required();
            return joi_1.default.object(schemaObject);
        };
        // common login input validator
        this.loginValidator = joi_1.default.object({
            email: joi_1.default.string().email().required().lowercase().messages({
                "string.base": "Enter valid email",
                "string.email": "Enter valid email",
                "any.required": "Email is required",
            }),
            password: joi_1.default.string().min(8).required().messages({
                "string.base": "Enter valid password",
                "string.min": "Enter valid password minimum length 8",
                "any.required": "Password is required",
            }),
        });
        //common register validator
        this.registerValidator = joi_1.default.object({
            username: joi_1.default.string().min(1).max(255).required(),
            name: joi_1.default.string().min(1).max(255).required(),
            gender: joi_1.default.string()
                .valid(...constants_1.GENDERS)
                .required(),
            email: joi_1.default.string().email().lowercase().min(1).max(255).required(),
            password: joi_1.default.string().min(8).max(100).required(),
            phone_number: joi_1.default.string().min(7).max(20).optional(),
        });
        //login with google validator
        this.loginWithGoogleValidator = joi_1.default.object({
            accessToken: joi_1.default.string().required(),
            image: joi_1.default.string().required(),
            name: joi_1.default.string().min(1).max(255).required(),
            email: joi_1.default.string().email().lowercase().min(1).max(255).required(),
        });
        //single param validator
        this.singleParamValidator = joi_1.default.object({
            id: joi_1.default.number().required(),
        });
        // limit skip
        this.getLimitSkipQueryValidator = joi_1.default.object({
            limit: joi_1.default.number().integer().optional(),
            skip: joi_1.default.number().integer().optional(),
            category_id: joi_1.default.string().optional(),
            city_id: joi_1.default.string().optional(),
            from_date: joi_1.default.string().optional(),
            to_date: joi_1.default.string().optional(),
            name: joi_1.default.string().allow("").optional(),
        });
        // Get nationality validator
        this.getNationality = joi_1.default.object({
            name: joi_1.default.string().optional().allow(""),
            limit: joi_1.default.number().integer().optional(),
            skip: joi_1.default.number().integer().optional(),
        });
        this.getAllJobSchema = joi_1.default.object({
            title: joi_1.default.string().min(1).max(255).optional(),
            status: joi_1.default.boolean().optional(),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            orderBy: joi_1.default.string().valid("title").optional(),
            orderTo: joi_1.default.string().valid("asc", "desc").optional(),
        });
        // common forget password input validator
        this.commonForgetPassInputValidation = joi_1.default.object({
            token: joi_1.default.string().required().messages({
                "string.base": "Provide valid token",
                "any.required": "Token is required",
            }),
            email: joi_1.default.string().email().optional().lowercase().messages({
                "string.base": "Provide valid email",
                "string.email": "Provide valid email",
            }),
            password: joi_1.default.string().min(8).required().messages({
                "string.base": "Provide valid password",
                "string.min": "Please provide valid password that's length must be min 8",
                "any.required": "Password is required",
            }),
        });
        this.commonTwoFAInputValidation = joi_1.default.object({
            token: joi_1.default.string().required().messages({
                "string.base": "Provide valid token",
                "any.required": "Token is required",
            }),
            email: joi_1.default.string().email().optional().lowercase().messages({
                "string.base": "Provide valid email",
                "string.email": "Provide valid email",
            }),
        });
        // send email otp input validator
        this.sendOtpInputValidator = joi_1.default.object({
            type: joi_1.default.string()
                .valid(...validatorConstant_1.SEND_OTP_TYPES)
                .required()
                .messages({
                "string.base": "Please enter valid OTP type",
                "any.only": "Please enter valid OTP type",
                "any.required": "OTP type is required",
            }),
            email: joi_1.default.string().email().lowercase().required().messages({
                "string.base": "Enter valid email address",
                "string.email": "Enter valid email address",
                "any.required": "Email is required",
            }),
        });
        // match email otp input validator
        this.matchEmailOtpInputValidator = joi_1.default.object({
            email: joi_1.default.string().email().lowercase().required().messages({
                "string.base": "Enter valid email",
                "string.email": "Enter valid email",
                "any.required": "Email is required",
            }),
            otp: joi_1.default.string().required().messages({
                "string.base": "Enter valid otp",
                "any.required": "OTP is required",
            }),
            type: joi_1.default.string()
                .valid(...validatorConstant_1.SEND_OTP_TYPES)
                .required()
                .messages({
                "string.base": "Enter valid otp type",
                "any.only": "Enter valid otp type",
                "any.required": "OTP type is required",
            }),
        });
        // common change password input validation
        this.changePassInputValidation = joi_1.default.object({
            old_password: joi_1.default.string().min(8).required().messages({
                "string.base": "Provide a valid old password",
                "string.min": "Provide a valid old password minimum length is 8",
                "any.required": "Old password is required",
            }),
            new_password: joi_1.default.string().min(8).required().messages({
                "string.base": "Provide a valid new password",
                "string.min": "Provide a valid new password minimum length is 8",
                "any.required": "New password is required",
            }),
        });
        this.registerJobSeekerValidator = joi_1.default.object({
            user: joi_1.default.object({
                name: joi_1.default.string().min(1).max(255).required(),
                email: joi_1.default.string().email().lowercase().min(1).max(255).required(),
                password: joi_1.default.string().min(8).max(100).required(),
                phone_number: joi_1.default.string().min(7).max(20).optional(),
            }).required(),
            job_seeker: joi_1.default.object({
                nationality: joi_1.default.number().integer().required(),
                account_status: joi_1.default.string()
                    .valid(...constants_1.USER_STATUS_ENUM)
                    .default("Pending"),
            }).required(),
            own_address: joi_1.default.object({
                address: joi_1.default.string().optional(),
                city: joi_1.default.string().max(100).optional(),
                country: joi_1.default.string().max(100).optional(),
                state: joi_1.default.string().max(100).optional(),
                longitude: joi_1.default.number().precision(6).optional(),
                latitude: joi_1.default.number().precision(6).optional(),
            }).optional(),
        });
        this.registerOrganizationValidator = joi_1.default.object({
            user: joi_1.default.object({
                name: joi_1.default.string().min(1).max(255).required(),
                email: joi_1.default.string().email().lowercase().min(1).max(255).required(),
                password: joi_1.default.string().min(8).max(100).required(),
                phone_number: joi_1.default.string().min(7).max(20).optional(),
            }).required(),
            organization: joi_1.default.object({
                org_name: joi_1.default.string().max(255).required(),
                details: joi_1.default.string().allow("").optional(),
            }).required(),
            organization_address: joi_1.default.object({
                city: joi_1.default.string().max(255).required(),
                state: joi_1.default.string().max(255).required(),
                country: joi_1.default.string().max(255).required(),
                address: joi_1.default.string().optional(),
                longitude: joi_1.default.number().precision(6).optional(),
                latitude: joi_1.default.number().precision(6).optional(),
                postal_code: joi_1.default.string().max(20).optional(),
            }).required(),
        });
        this.getNotificationValidator = joi_1.default.object({
            limit: joi_1.default.number().integer().optional(),
            skip: joi_1.default.number().integer().optional(),
        });
        this.mutationNotificationValidator = joi_1.default.object({
            id: joi_1.default.number().integer().positive().optional(),
        });
        // get single item with id validator
        this.getSingleItemWithIdValidator = joi_1.default.object({
            id: joi_1.default.number().integer().required(),
        });
        //   get reports data query
        this.getReportQueryValidator = joi_1.default.object({
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            searchQuery: joi_1.default.string().optional(),
            type: joi_1.default.string()
                .valid(...constants_1.REPORT_TYPE_ENUM)
                .optional(),
            report_status: joi_1.default.string()
                .valid(...constants_1.REPORT_STATUS_ENUM)
                .optional(),
        });
    }
    // multiple params number validator
    multipleParamsNumValidator(fields) {
        const schemaObject = {};
        fields.forEach((item) => {
            schemaObject[item] = joi_1.default.number().required();
        });
        return joi_1.default.object(schemaObject);
    }
    // multiple params string validator
    multipleParamsStringValidator(fields) {
        const schemaObject = {};
        fields.forEach((item) => {
            schemaObject[item] = joi_1.default.number().required();
        });
        return joi_1.default.object(schemaObject);
    }
}
exports.default = PublicCommonValidator;
