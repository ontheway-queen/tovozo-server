"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const jobs_controller_1 = __importDefault(require("../controller/jobs.controller"));
class AdminJobRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new jobs_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .get(this.controller.getAllJob)
            .post(this.controller.createJob);
        this.router
            .route("/:id")
            .patch(this.controller.updateJob)
            .delete(this.controller.deleteJob);
    }
}
exports.default = AdminJobRouter;
