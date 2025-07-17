"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobSeekerCancellationApplicationLogsRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const jobSeekerCancellationLog_controller_1 = require("../controller/jobSeekerCancellationLog.controller");
class JobSeekerCancellationApplicationLogsRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new jobSeekerCancellationLog_controller_1.JobSeekerCancellationApplicationLogController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .get(this.controller.getCancellationApplicationLogs);
        this.router
            .route("/:id")
            .get(this.controller.getCancellationApplicationLog);
    }
}
exports.JobSeekerCancellationApplicationLogsRouter = JobSeekerCancellationApplicationLogsRouter;
