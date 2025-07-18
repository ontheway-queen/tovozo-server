"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const profile_controller_1 = __importDefault(require("../controller/profile.controller"));
class HotelierProfileRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new profile_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        // get profile
        this.router.route("/").get(this.controller.getProfile);
        // change password
        this.router.route("/change-password").post(this.controller.changePassword);
    }
}
exports.default = HotelierProfileRouter;
