"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
class HotelierProfileValidator {
    constructor() {
        this.updateProfile = joi_1.default.object({
            user: joi_1.default.object({
                name: joi_1.default.string().optional(),
                device_id: joi_1.default.string().optional(),
                phone_number: joi_1.default.string().optional(),
            }).optional(),
            organization: joi_1.default.object({
                name: joi_1.default.string().optional(),
                details: joi_1.default.string().optional(),
                status: joi_1.default.string()
                    .valid(...constants_1.USER_STATUS_ENUM)
                    .optional(),
                location_id: joi_1.default.number().optional(),
            }).optional(),
            org_address: joi_1.default.object({
                name: joi_1.default.string().optional(),
                address: joi_1.default.string().optional(),
                city: joi_1.default.string().optional(),
                state: joi_1.default.string().optional(),
                country: joi_1.default.string().optional(),
                longitute: joi_1.default.number().precision(6).optional(),
                latitute: joi_1.default.number().precision(6).optional(),
                postal_code: joi_1.default.string()
                    .pattern(/^[0-9]+$/)
                    .optional()
                    .messages({
                    "string.pattern.base": "Postal code must contain only numbers",
                }),
                is_home_address: joi_1.default.boolean().optional(),
            }).custom((value, helpers) => {
                if (value.city && !value.state) {
                    return helpers.message({
                        custom: "State is required when city is provided",
                    });
                }
                if (value.city && !value.country) {
                    return helpers.message({
                        custom: "Country is required when city is provided",
                    });
                }
                return value;
            }, "City dependency validation"),
        });
    }
}
exports.default = HotelierProfileValidator;
