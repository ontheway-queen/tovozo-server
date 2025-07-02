"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const jobApplication_controller_1 = __importDefault(require("../controller/jobApplication.controller"));
class AdminJobApplicationRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new jobApplication_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/").post(this.controller.assignJobApplication);
    }
}
exports.default = AdminJobApplicationRouter;
