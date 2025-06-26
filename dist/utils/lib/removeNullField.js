"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RemoveNullField {
    static clean(obj) {
        return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== null && value !== undefined));
    }
    static cleanArray(arr) {
        return arr.map(RemoveNullField.clean);
    }
}
exports.default = RemoveNullField;
