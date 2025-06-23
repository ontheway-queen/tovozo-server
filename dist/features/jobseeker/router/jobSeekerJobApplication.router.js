"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobSeekerJobApplicationRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const jobSeeker_jobApplication_controller_1 = require("../controller/jobSeeker.jobApplication.controller");
class JobSeekerJobApplicationRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new jobSeeker_jobApplication_controller_1.JobSeekerJobApplicationController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .post(this.controller.createJobApplication)
            .get(this.controller.getMyJobApplications);
        this.router
            .route("/:id")
            .get(this.controller.getMyJobApplication)
            .delete(this.controller.cancelMyJobApplication);
    }
}
exports.JobSeekerJobApplicationRouter = JobSeekerJobApplicationRouter;
