"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobSeekerJobsRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const jobSeekerJobs_controller_1 = require("../controller/jobSeekerJobs.controller");
class JobSeekerJobsRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new jobSeekerJobs_controller_1.JobSeekerJobsController();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/").get(this.controller.getJobs);
    }
}
exports.JobSeekerJobsRouter = JobSeekerJobsRouter;
