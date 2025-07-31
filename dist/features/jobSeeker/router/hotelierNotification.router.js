"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const hotelierNotification_controller_1 = __importDefault(require("../controller/hotelierNotification.controller"));
class HotelierNotificationRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new hotelierNotification_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .get(this.controller.getAllNotification)
            .delete(this.controller.deleteNotification)
            .patch(this.controller.readNotification);
    }
}
exports.default = HotelierNotificationRouter;
