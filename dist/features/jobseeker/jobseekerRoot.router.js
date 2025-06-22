"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstract/abstract.router"));
const jobSeekerProfile_router_1 = __importDefault(require("./router/jobSeekerProfile.router"));
const jobSeekerJobs_router_1 = require("./router/jobSeekerJobs.router");
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
    }
}
exports.default = JobSeekerRootRouter;
