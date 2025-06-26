"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AdminHotelierValidator {
    constructor() {
        this.createHotelier = joi_1.default.object({
            user: joi_1.default.object({
                name: joi_1.default.string().required(),
                email: joi_1.default.string().email().required(),
                username: joi_1.default.string().required(),
                password: joi_1.default.string().min(6).required(),
                phone_number: joi_1.default.string().required(),
                photo: joi_1.default.string().optional(),
                designation: joi_1.default.string().required(),
            }).required(),
            organization: joi_1.default.object({
                name: joi_1.default.string().required(),
                description: joi_1.default.string().optional(),
            }).optional(),
            organization_address: joi_1.default.object({
                address_line: joi_1.default.string().required(),
                city: joi_1.default.string().required(),
                country: joi_1.default.string().required(),
                zip_code: joi_1.default.string().optional(),
            }).optional(),
            organization_amenities: joi_1.default.array()
                .items(joi_1.default.string().max(255).required())
                .optional(),
        });
    }
}
exports.default = AdminHotelierValidator;
