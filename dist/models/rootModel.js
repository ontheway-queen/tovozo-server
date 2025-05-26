"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../app/database");
const userModel_1 = __importDefault(require("./userModel/userModel"));
const adminModel_1 = __importDefault(require("./adminModel/adminModel"));
const jobSeekerModel_1 = __importDefault(require("./jobSeekerModel/jobSeekerModel"));
const commonModel_1 = __importDefault(require("./commonModel/commonModel"));
const organizationModel_1 = __importDefault(require("./hotelierModel/organizationModel"));
class Models {
    UserModel(trx) {
        return new userModel_1.default(trx || database_1.db);
    }
    AdminModel(trx) {
        return new adminModel_1.default(trx || database_1.db);
    }
    // job seeker model
    jobSeekerModel(trx) {
        return new jobSeekerModel_1.default(trx || database_1.db);
    }
    // common models
    commonModel(trx) {
        return new commonModel_1.default(trx || database_1.db);
    }
    // organization model
    organizationModel(trx) {
        return new organizationModel_1.default(trx || database_1.db);
    }
}
exports.default = Models;
