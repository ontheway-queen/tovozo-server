"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobSeekerCancellationApplicationReportsRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const jobSeekerCancellationReport_controller_1 = require("../controller/jobSeekerCancellationReport.controller");
class JobSeekerCancellationApplicationReportsRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new jobSeekerCancellationReport_controller_1.JobSeekerCancellationApplicationReportController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .get(this.controller.getgetCancellationApplicationReports);
        this.router
            .route("/:id")
            .get(this.controller.getCancellationApplicationReport);
    }
}
exports.JobSeekerCancellationApplicationReportsRouter = JobSeekerCancellationApplicationReportsRouter;
