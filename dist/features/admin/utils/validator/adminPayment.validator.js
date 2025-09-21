"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const userModelTypes_1 = require("../../../../utils/modelTypes/user/userModelTypes");
class AdminPaymentValidator {
    constructor() {
        this.getAllPaymentLedgerQuery = joi_1.default.object({
            name: joi_1.default.string().allow("").optional(),
            from_date: joi_1.default.string().optional(),
            to_date: joi_1.default.string().optional(),
            user_id: joi_1.default.number().optional(),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            type: joi_1.default.string()
                .valid(...Object.values(userModelTypes_1.TypeUser))
                .optional(),
        });
    }
}
exports.default = AdminPaymentValidator;
