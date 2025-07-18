"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstract/abstract.router"));
const jobSeekerCancellationLog_router_1 = require("./router/jobSeekerCancellationLog.router");
const jobSeekerJobApplication_router_1 = require("./router/jobSeekerJobApplication.router");
const jobSeekerJobs_router_1 = require("./router/jobSeekerJobs.router");
const jobSeekerJobTaskActivity_router_1 = __importDefault(require("./router/jobSeekerJobTaskActivity.router"));
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
    }
}
exports.default = JobSeekerRootRouter;
