"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class HotelierProfileValidator {
    constructor() {
        this.updateProfile = joi_1.default.object({
            user: joi_1.default.object({
                device_id: joi_1.default.string().optional(),
            }).optional(),
        });
    }
}
exports.default = HotelierProfileValidator;
