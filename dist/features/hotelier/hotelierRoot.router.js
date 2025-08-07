"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstract/abstract.router"));
const hotelierCancellationLog_router_1 = __importDefault(require("./router/hotelierCancellationLog.router"));
const hotelierChat_router_1 = require("./router/hotelierChat.router");
const hotelierJobPost_router_1 = __importDefault(require("./router/hotelierJobPost.router"));
const hotelierJobTaskActivities_router_1 = __importDefault(require("./router/hotelierJobTaskActivities.router"));
const hotelierNotification_router_1 = __importDefault(require("./router/hotelierNotification.router"));
const hotelierReport_router_1 = __importDefault(require("./router/hotelierReport.router"));
const payment_router_1 = __importDefault(require("./router/payment.router"));
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
        this.router.use("/cancellation-logs", new hotelierCancellationLog_router_1.default().router);
        this.router.use("/job-task-activity", new hotelierJobTaskActivities_router_1.default().router);
        this.router.use("/reports", new hotelierReport_router_1.default().router);
        this.router.use("/payment", new payment_router_1.default().router);
        this.router.use("/notification", new hotelierNotification_router_1.default().router);
        this.router.use("/chat", new hotelierChat_router_1.HotelierChatRouter().router);
    }
}
exports.default = HotelierRootRouter;
