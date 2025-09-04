"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstract/abstract.router"));
const bankDetails_router_1 = require("./router/bankDetails.router");
const jobSeekerCancellationLog_router_1 = require("./router/jobSeekerCancellationLog.router");
const jobSeekerChat_router_1 = require("./router/jobSeekerChat.router");
const jobSeekerJobApplication_router_1 = require("./router/jobSeekerJobApplication.router");
const jobSeekerJobs_router_1 = require("./router/jobSeekerJobs.router");
const jobSeekerJobTaskActivity_router_1 = __importDefault(require("./router/jobSeekerJobTaskActivity.router"));
const jobSeekerNotification_router_1 = __importDefault(require("./router/jobSeekerNotification.router"));
const jobSeekerPayment_router_1 = __importDefault(require("./router/jobSeekerPayment.router"));
const jobSeekerPayout_router_1 = __importDefault(require("./router/jobSeekerPayout.router"));
const jobSeekerProfile_router_1 = __importDefault(require("./router/jobSeekerProfile.router"));
const jobSeekerReport_router_1 = __importDefault(require("./router/jobSeekerReport.router"));
class JobSeekerRootRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.callRouter();
    }
    callRouter() {
        // profile router
        this.router.use("/profile", new jobSeekerProfile_router_1.default().router);
        // job seeker jobs router
        this.router.use("/jobs", new jobSeekerJobs_router_1.JobSeekerJobsRouter().router);
        // job seeker job application router
        this.router.use("/job-application", new jobSeekerJobApplication_router_1.JobSeekerJobApplicationRouter().router);
        this.router.use("/cancellation-logs", new jobSeekerCancellationLog_router_1.JobSeekerCancellationApplicationLogsRouter().router);
        this.router.use("/job-task-activity", new jobSeekerJobTaskActivity_router_1.default().router);
        // reports
        this.router.use("/reports", new jobSeekerReport_router_1.default().router);
        // payments
        this.router.use("/payments", new jobSeekerPayment_router_1.default().router);
        this.router.use("/notification", new jobSeekerNotification_router_1.default().router);
        this.router.use("/chat", new jobSeekerChat_router_1.JobSeekerChatRouter().router);
        this.router.use("/payouts", new jobSeekerPayout_router_1.default().router);
        this.router.use("/bank-details", new bankDetails_router_1.BankDetailsRouter().router);
    }
}
exports.default = JobSeekerRootRouter;
