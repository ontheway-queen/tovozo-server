"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const cancellationReport_controller_1 = __importDefault(require("../controller/cancellationReport.controller"));
class CancellationReportRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new cancellationReport_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/").get(this.controller.getReports);
        this.router
            .route("/:id")
            .get(this.controller.getSingleReport)
            .patch(this.controller.updateCancellationReportStatus);
    }
}
exports.default = CancellationReportRouter;
