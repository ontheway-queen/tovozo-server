"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class HotelierChatValidator {
    constructor() {
        this.getMessagesValidator = joi_1.default.object({
            session_id: joi_1.default.string().required(),
        });
        this.sendMessageValidator = joi_1.default.object({
            message: joi_1.default.string().required(),
            chat_session_id: joi_1.default.number().positive().required(),
        });
    }
}
exports.default = HotelierChatValidator;
