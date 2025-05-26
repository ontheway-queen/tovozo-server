"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AuthValidator {
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
            gender: joi_1.default.string().valid("Male", "Female", "Other").required(),
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
                .valid(...SEND_OTP_TYPES)
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
                .valid(...SEND_OTP_TYPES)
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
exports.default = AuthValidator;
