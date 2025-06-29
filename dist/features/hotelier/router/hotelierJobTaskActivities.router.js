"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const HotelierJobTaskActivities_controller_1 = __importDefault(require("../controller/HotelierJobTaskActivities.controller"));
class HotelierJobTaskActivitiesRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.hotelierJobTaskActivityController = new HotelierJobTaskActivities_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/:id")
            .patch(this.hotelierJobTaskActivityController.approveJobTaskActivity);
    }
}
exports.default = HotelierJobTaskActivitiesRouter;
