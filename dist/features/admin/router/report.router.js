"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const report_controller_1 = __importDefault(require("../controller/report.controller"));
class AdminReportRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.adminReportController = new report_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .get(this.adminReportController.getReportsWithInfo);
        this.router
            .route("/:id")
            .patch(this.adminReportController.reportMarkAsAcknowledge);
    }
}
exports.default = AdminReportRouter;
