"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class HotelierPaymentValidator {
    constructor() {
        this.getPaymentsForHotelierQueryValidator = joi_1.default.object({
            search: joi_1.default.string().valid().optional(),
            limit: joi_1.default.string().optional(),
            skip: joi_1.default.string().optional(),
        });
    }
}
exports.default = HotelierPaymentValidator;
