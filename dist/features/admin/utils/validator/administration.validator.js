"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AdminAdministrationValidator {
    constructor() {
        //Role validation
        this.createRole = joi_1.default.object({
            role_name: joi_1.default.string().required(),
            permissions: joi_1.default.array()
                .items({
                permission_id: joi_1.default.number().required(),
                read: joi_1.default.number().valid(0, 1).required(),
                update: joi_1.default.number().valid(0, 1).required(),
                write: joi_1.default.number().valid(0, 1).required(),
                delete: joi_1.default.number().valid(0, 1).required(),
            })
                .required(),
        });
        //Permission validation
        this.createPermission = joi_1.default.object({
            permission_name: joi_1.default.string().min(1).max(255).required(),
        });
        //Update role permissions validator
        this.updateRolePermissions = joi_1.default.object({
            role_name: joi_1.default.string().optional(),
            status: joi_1.default.number().valid(0, 1).optional(),
            permissions: joi_1.default.array()
                .items({
                permission_id: joi_1.default.number().required(),
                read: joi_1.default.number().valid(0, 1).required(),
                update: joi_1.default.number().valid(0, 1).required(),
                write: joi_1.default.number().valid(0, 1).required(),
                delete: joi_1.default.number().valid(0, 1).required(),
            })
                .optional(),
        });
        //create admin
        this.createAdmin = joi_1.default.object({
            username: joi_1.default.string().required().lowercase().trim(),
            name: joi_1.default.string().required(),
            email: joi_1.default.string().email().lowercase().required(),
            password: joi_1.default.string().min(8).required(),
            phone_number: joi_1.default.string().required(),
            role_id: joi_1.default.number().required(),
        });
        // Create B2B Admin validator
        this.createB2bAdmin = joi_1.default.object({
            name: joi_1.default.string().required(),
            email: joi_1.default.string().email().lowercase().required(),
            password: joi_1.default.string().min(8).required(),
            mobile_number: joi_1.default.string().required(),
            role_id: joi_1.default.number().required(),
        });
        // Update B2B Admin
        this.updateB2bAdmin = joi_1.default.object({
            name: joi_1.default.string(),
            email: joi_1.default.string().email().lowercase(),
            password: joi_1.default.string().min(8),
            mobile_number: joi_1.default.string(),
            role_id: joi_1.default.number(),
        });
        //get all admin query validator
        this.getAllAdminQueryValidator = joi_1.default.object({
            filter: joi_1.default.string(),
            role: joi_1.default.number(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number(),
            status: joi_1.default.string(),
        });
        //update admin
        this.updateAdmin = joi_1.default.object({
            username: joi_1.default.string(),
            name: joi_1.default.string(),
            phone_number: joi_1.default.string(),
            role_id: joi_1.default.number(),
            status: joi_1.default.boolean(),
            is_2fa_on: joi_1.default.boolean().optional(),
        });
        //get users filter validator
        this.getUsersFilterValidator = joi_1.default.object({
            filter: joi_1.default.string(),
            status: joi_1.default.boolean(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number(),
        });
        //update user profile
        this.editUserProfileValidator = joi_1.default.object({
            username: joi_1.default.string().min(1).max(255).optional(),
            is_2fa_on: joi_1.default.boolean().optional(),
            name: joi_1.default.string().optional(),
        });
        //create city
        this.createCityValidator = joi_1.default.object({
            country_id: joi_1.default.number().required(),
            name: joi_1.default.string().required(),
        });
    }
}
exports.default = AdminAdministrationValidator;
