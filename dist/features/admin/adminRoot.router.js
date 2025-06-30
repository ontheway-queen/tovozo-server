"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const administration_router_1 = __importDefault(require("./router/administration.router"));
const jobs_router_1 = __importDefault(require("./router/jobs.router"));
const jobSeeker_router_1 = __importDefault(require("./router/jobSeeker.router"));
const profile_router_1 = __importDefault(require("./router/profile.router"));
const cancellationReport_router_1 = __importDefault(require("./router/cancellationReport.router"));
const hotelier_router_1 = __importDefault(require("./router/hotelier.router"));
const jobPost_router_1 = __importDefault(require("./router/jobPost.router"));
class AdminRootRouter {
    constructor() {
        this.Router = (0, express_1.Router)();
        this.AdminAdministrationRouter = new administration_router_1.default();
        this.adminProfileRouter = new profile_router_1.default();
        this.adminJobRouter = new jobs_router_1.default();
        this.adminJobSeekerRouter = new jobSeeker_router_1.default();
        this.adminHotelierRouter = new hotelier_router_1.default();
        this.cancellationReportRouter = new cancellationReport_router_1.default();
        this.jobPostRouter = new jobPost_router_1.default();
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
    }
}
exports.default = AdminRootRouter;
