"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const jobSeekerReport_controller_1 = __importDefault(require("../controller/jobSeekerReport.controller"));
class JobSeekerReportRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.jobSeekerReportController = new jobSeekerReport_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .post(this.jobSeekerReportController.submitReport)
            .get(this.jobSeekerReportController.getReportsWithInfo);
        this.router
            .route("/:id")
            .get(this.jobSeekerReportController.getSingleReportWithInfo);
    }
}
exports.default = JobSeekerReportRouter;
