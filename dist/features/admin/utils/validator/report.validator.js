"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class ReportValidator {
    constructor() {
        this.markAsAcknowledgeReportSchema = joi_1.default.object({
            resolution: joi_1.default.string().required(),
        });
    }
}
exports.default = ReportValidator;
