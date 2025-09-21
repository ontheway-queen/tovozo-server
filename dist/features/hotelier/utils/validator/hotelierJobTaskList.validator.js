"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class HotelierJobTaskListValidator {
    constructor() {
        this.createJobTaskList = joi_1.default.object({
            job_task_activity_id: joi_1.default.number().required(),
            tasks: joi_1.default.array()
                .items(joi_1.default.object({
                message: joi_1.default.string().required(),
            }))
                .min(1)
                .required(),
        });
        this.updateJobTaskList = joi_1.default.object({
            message: joi_1.default.string().optional(),
        });
    }
}
exports.default = HotelierJobTaskListValidator;
