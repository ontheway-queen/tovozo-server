"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const cancellationLog_controller_1 = __importDefault(require("../controller/cancellationLog.controller"));
class CancellationReportRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new cancellationLog_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/").get(this.controller.getCancellationLogs);
        this.router
            .route("/:id")
            .get(this.controller.getSingleCancellationLog)
            .patch(this.controller.updateCancellationLogStatus);
    }
}
exports.default = CancellationReportRouter;
