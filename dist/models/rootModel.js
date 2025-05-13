"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../app/database");
const userModel_1 = __importDefault(require("./userModel/userModel"));
const adminModel_1 = __importDefault(require("./adminModel/adminModel"));
class Models {
    UserModel(trx) {
        return new userModel_1.default(trx || database_1.db);
    }
    AdminModel(trx) {
        return new adminModel_1.default(trx || database_1.db);
    }
}
exports.default = Models;
