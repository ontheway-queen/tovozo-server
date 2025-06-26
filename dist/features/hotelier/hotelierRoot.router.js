"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstract/abstract.router"));
const hotelierCancellationReport_router_1 = __importDefault(require("./router/hotelierCancellationReport.router"));
const hotelierJobPost_router_1 = __importDefault(require("./router/hotelierJobPost.router"));
const profile_router_1 = __importDefault(require("./router/profile.router"));
class HotelierRootRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.callRouter();
    }
    callRouter() {
        // profile router
        this.router.use("/profile", new profile_router_1.default().router);
        this.router.use("/job-post", new hotelierJobPost_router_1.default().router);
        this.router.use("/cancellation-reports", new hotelierCancellationReport_router_1.default().router);
    }
}
exports.default = HotelierRootRouter;
