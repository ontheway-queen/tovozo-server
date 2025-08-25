"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripePayoutValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class StripePayoutValidator {
    constructor() {
        this.addStripePayoutAccount = joi_1.default.object({
            country: joi_1.default.string().min(2).max(2).required(),
            email: joi_1.default.string().email().required(),
            visa_copy: joi_1.default.string().optional(),
            passport_copy: joi_1.default.string().optional(),
            id_copy: joi_1.default.string().optional(),
        });
    }
}
exports.StripePayoutValidator = StripePayoutValidator;
