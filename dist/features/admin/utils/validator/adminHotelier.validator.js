"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
class AdminHotelierValidator {
    constructor() {
        this.createHotelier = joi_1.default.object({
            user: joi_1.default.object({
                name: joi_1.default.string().required(),
                email: joi_1.default.string().email().required(),
                password: joi_1.default.string().min(6).required(),
                phone_number: joi_1.default.string().required(),
                photo: joi_1.default.string().optional(),
                designation: joi_1.default.string().required(),
            }).required(),
            organization: joi_1.default.object({
                org_name: joi_1.default.string().required(),
                description: joi_1.default.string().optional(),
            }).required(),
            organization_address: joi_1.default.object({
                name: joi_1.default.string().max(100).optional(),
                address: joi_1.default.string().required(),
                city_id: joi_1.default.string().required(),
                postal_code: joi_1.default.string().optional(),
                longitude: joi_1.default.string().required(),
                latitude: joi_1.default.string().required(),
            }).optional(),
            organization_amenities: joi_1.default.array()
                .items(joi_1.default.string().max(255).required())
                .optional(),
        });
        this.getHoteliersQuery = joi_1.default.object({
            id: joi_1.default.number().optional(),
            user_id: joi_1.default.number().optional(),
            name: joi_1.default.string().trim().min(1).max(255),
            status: joi_1.default.string()
                .valid(...constants_1.USER_STATUS_ENUM)
                .optional(),
            from_date: joi_1.default.date().optional(),
            to_date: joi_1.default.date().optional(),
            limit: joi_1.default.number().integer().default(100).optional(),
            skip: joi_1.default.number().integer().default(0).optional(),
        });
        this.updateHotelier = joi_1.default.object({
            user: joi_1.default.object({
                name: joi_1.default.string().optional(),
                email: joi_1.default.string().email().optional(),
                password: joi_1.default.string().min(6).optional(),
                phone_number: joi_1.default.string().optional(),
                photo: joi_1.default.string().optional(),
                designation: joi_1.default.string().optional(),
            }).optional(),
            organization: joi_1.default.object({
                name: joi_1.default.string().optional(),
                description: joi_1.default.string().optional(),
                status: joi_1.default.string()
                    .valid(...constants_1.USER_STATUS_ENUM)
                    .optional(),
            }).optional(),
            organization_address: joi_1.default.object({
                name: joi_1.default.string().max(100).optional(),
                address: joi_1.default.string().optional(),
                city_id: joi_1.default.string().optional(),
                postal_code: joi_1.default.string().optional(),
                longitude: joi_1.default.string().optional(),
                latitude: joi_1.default.string().optional(),
            }).optional(),
            organization_amenities: joi_1.default.array()
                .items(joi_1.default.string().max(255).optional())
                .optional(),
        });
    }
}
exports.default = AdminHotelierValidator;
