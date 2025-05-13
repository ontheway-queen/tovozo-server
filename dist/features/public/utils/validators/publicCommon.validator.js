"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class PublicCommonValidator {
    constructor() {
        this.singleParamNumValidator = (idFieldName = 'id') => {
            const schemaObject = {};
            schemaObject[idFieldName] = joi_1.default.number().required();
            return joi_1.default.object(schemaObject);
        };
        // single param string validator
        this.singleParamStringValidator = (idFieldName = 'id') => {
            const schemaObject = {};
            schemaObject[idFieldName] = joi_1.default.string().required();
            return joi_1.default.object(schemaObject);
        };
    }
    // multiple params number validator
    multipleParamsNumValidator(fields) {
        const schemaObject = {};
        fields.forEach((item) => {
            schemaObject[item] = joi_1.default.number().required();
        });
        return joi_1.default.object(schemaObject);
    }
    // multiple params string validator
    multipleParamsStringValidator(fields) {
        const schemaObject = {};
        fields.forEach((item) => {
            schemaObject[item] = joi_1.default.number().required();
        });
        return joi_1.default.object(schemaObject);
    }
}
exports.default = PublicCommonValidator;
