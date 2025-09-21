"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const HotelierReport_controller_1 = __importDefault(require("../controller/HotelierReport.controller"));
class HotelierReportRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.hotelierReportController = new HotelierReport_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/").post(this.hotelierReportController.submitReport);
    }
}
exports.default = HotelierReportRouter;
