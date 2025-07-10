"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const hotelierCancellationReport_controller_1 = __importDefault(require("../controller/hotelierCancellationReport.controller"));
class HotelierCancellationLogRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new hotelierCancellationReport_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/").get(this.controller.getCancellationLogs);
        this.router
            .route("/:id")
            .get(this.controller.getCancellationLog)
            .delete(this.controller.cancelJobPostCancellationLog);
    }
}
exports.default = HotelierCancellationLogRouter;
