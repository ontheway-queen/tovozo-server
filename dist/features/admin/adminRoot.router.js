"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminChatRouter_1 = __importDefault(require("./router/adminChatRouter"));
const administration_router_1 = __importDefault(require("./router/administration.router"));
const cancellationLog_router_1 = __importDefault(require("./router/cancellationLog.router"));
const hotelier_router_1 = __importDefault(require("./router/hotelier.router"));
const jobApplication_router_1 = __importDefault(require("./router/jobApplication.router"));
const jobPost_router_1 = __importDefault(require("./router/jobPost.router"));
const jobs_router_1 = __importDefault(require("./router/jobs.router"));
const jobSeeker_router_1 = __importDefault(require("./router/jobSeeker.router"));
const profile_router_1 = __importDefault(require("./router/profile.router"));
const report_router_1 = __importDefault(require("./router/report.router"));
const adminPayment_router_1 = __importDefault(require("./router/adminPayment.router"));
class AdminRootRouter {
    constructor() {
        this.Router = (0, express_1.Router)();
        this.AdminAdministrationRouter = new administration_router_1.default();
        this.adminProfileRouter = new profile_router_1.default();
        this.adminJobRouter = new jobs_router_1.default();
        this.adminJobSeekerRouter = new jobSeeker_router_1.default();
        this.adminHotelierRouter = new hotelier_router_1.default();
        this.cancellationReportRouter = new cancellationLog_router_1.default();
        this.jobPostRouter = new jobPost_router_1.default();
        this.reportRouter = new report_router_1.default();
        this.jobApplicationRouter = new jobApplication_router_1.default();
        this.adminChatRouter = new adminChatRouter_1.default();
        this.paymentRouter = new adminPayment_router_1.default();
        this.callRouter();
    }
    callRouter() {
        //administration
        this.Router.use("/administration", this.AdminAdministrationRouter.router);
        // profile router
        this.Router.use("/profile", this.adminProfileRouter.router);
        // job router
        this.Router.use("/job-category", this.adminJobRouter.router);
        // Job seeker
        this.Router.use("/job-seeker", this.adminJobSeekerRouter.router);
        // hotelier
        this.Router.use("/hotelier", this.adminHotelierRouter.router);
        // jobs
        this.Router.use("/jobs", this.jobPostRouter.router);
        // cancellation report
        this.Router.use("/cancellation-report", this.cancellationReportRouter.router);
        // report
        this.Router.use("/reports", this.reportRouter.router);
        // job-application
        this.Router.use("/job-application", this.jobApplicationRouter.router);
        // chat
        this.Router.use("/chat", this.adminChatRouter.router);
        // payment
        this.Router.use("/payments", this.paymentRouter.router);
    }
}
exports.default = AdminRootRouter;
