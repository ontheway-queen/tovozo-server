"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelierJobPostValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class HotelierJobPostValidator {
    constructor() {
        this.createJobPostSchema = joi_1.default.object({});
    }
}
exports.HotelierJobPostValidator = HotelierJobPostValidator;
