"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../app/database");
const administrationModel_1 = __importDefault(require("./adminModel/administrationModel"));
const adminModel_1 = __importDefault(require("./adminModel/adminModel"));
const cancellationLogModel_1 = __importDefault(require("./cancellationLogModel/cancellationLogModel"));
const chatModel_1 = __importDefault(require("./chatModel/chatModel"));
const commonModel_1 = __importDefault(require("./commonModel/commonModel"));
const jobPostModel_1 = __importDefault(require("./hotelierModel/jobPostModel"));
const organizationModel_1 = __importDefault(require("./hotelierModel/organizationModel"));
const jobApplicationModel_1 = __importDefault(require("./jobApplicationModel/jobApplicationModel"));
const jobModel_1 = __importDefault(require("./jobModel/jobModel"));
const jobSeekerModel_1 = __importDefault(require("./jobSeekerModel/jobSeekerModel"));
const jobTaskActivitiesModel_1 = __importDefault(require("./jobTaskActivitiesModel/jobTaskActivitiesModel"));
const jobTaskListModel_1 = __importDefault(require("./jobTaskActivitiesModel/jobTaskListModel"));
const reportModel_1 = __importDefault(require("./reportModel/reportModel"));
const userModel_1 = __importDefault(require("./userModel/userModel"));
const paymentModel_1 = __importDefault(require("./paymentModel/paymentModel"));
const statistics_model_1 = __importDefault(require("./statistics/statistics.model"));
const payoutRequestsModel_1 = __importDefault(require("./payout_requests/payoutRequestsModel"));
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
    cancellationLogModel(trx) {
        return new cancellationLogModel_1.default(trx || database_1.db);
    }
    // job task activities
    jobTaskActivitiesModel(trx) {
        return new jobTaskActivitiesModel_1.default(trx || database_1.db);
    }
    // job task list
    jobTaskListModel(trx) {
        return new jobTaskListModel_1.default(trx || database_1.db);
    }
    // report
    reportModel(trx) {
        return new reportModel_1.default(trx || database_1.db);
    }
    // chat
    chatModel(trx) {
        return new chatModel_1.default(trx || database_1.db);
    }
    // payment
    paymnentModel(trx) {
        return new paymentModel_1.default(trx || database_1.db);
    }
    // Admin stats
    statisticsModel(trx) {
        return new statistics_model_1.default(trx || database_1.db);
    }
    // payout request
    payoutRequestModel(trx) {
        return new payoutRequestsModel_1.default(trx || database_1.db);
    }
}
exports.default = Models;
