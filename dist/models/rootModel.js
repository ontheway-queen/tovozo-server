"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../app/database");
const administrationModel_1 = __importDefault(require("./adminModel/administrationModel"));
const adminModel_1 = __importDefault(require("./adminModel/adminModel"));
const commonModel_1 = __importDefault(require("./commonModel/commonModel"));
const jobPostModel_1 = __importDefault(require("./hotelierModel/jobPostModel"));
const organizationModel_1 = __importDefault(require("./hotelierModel/organizationModel"));
const jobModel_1 = __importDefault(require("./jobModel/jobModel"));
const jobSeekerModel_1 = __importDefault(require("./jobSeekerModel/jobSeekerModel"));
const userModel_1 = __importDefault(require("./userModel/userModel"));
const jobApplicationModel_1 = __importDefault(require("./jobApplicationModel/jobApplicationModel"));
const cancellationReportModel_1 = __importDefault(require("./cancellationReportModel/cancellationReportModel"));
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
    //administration model
    administrationModel(trx) {
        return new administrationModel_1.default(trx || database_1.db);
    }
    // job model
    jobModel(trx) {
        return new jobModel_1.default(trx || database_1.db);
    }
    // jobPost model
    jobPostModel(trx) {
        return new jobPostModel_1.default(trx || database_1.db);
    }
    // job application model
    jobApplicationModel(trx) {
        return new jobApplicationModel_1.default(trx || database_1.db);
    }
    // cancellation report model
    cancellationReportModel(trx) {
        return new cancellationReportModel_1.default(trx || database_1.db);
    }
}
exports.default = Models;
