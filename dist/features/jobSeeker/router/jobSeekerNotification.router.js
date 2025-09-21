"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const jobSeekerNotification_controller_1 = __importDefault(require("../controller/jobSeekerNotification.controller"));
class jobSeekerNotificationRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new jobSeekerNotification_controller_1.default();
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
exports.default = jobSeekerNotificationRouter;
