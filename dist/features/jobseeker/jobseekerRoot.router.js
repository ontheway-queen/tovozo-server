"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstract/abstract.router"));
const jobSeekerProfile_router_1 = __importDefault(require("./router/jobSeekerProfile.router"));
const jobSeekerJobs_router_1 = require("./router/jobSeekerJobs.router");
const jobSeekerJobApplication_router_1 = require("./router/jobSeekerJobApplication.router");
const jobSeekerCancellationReport_router_1 = require("./router/jobSeekerCancellationReport.router");
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
        this.router.use("/cancellation-reports", new jobSeekerCancellationReport_router_1.JobSeekerCancellationApplicationReportsRouter().router);
    }
}
exports.default = JobSeekerRootRouter;
