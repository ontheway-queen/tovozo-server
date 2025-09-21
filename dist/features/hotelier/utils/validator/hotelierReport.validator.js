"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
class HotelierReportValidator {
    constructor() {
        this.submitReport = joi_1.default.object({
            related_id: joi_1.default.number().required(),
            job_post_details_id: joi_1.default.number().required(),
            report_type: joi_1.default.string()
                .valid(...constants_1.REPORT_TYPE_ENUM)
                .required(),
            reason: joi_1.default.string().required(),
        });
    }
}
exports.default = HotelierReportValidator;
