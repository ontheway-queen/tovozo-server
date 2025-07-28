"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const hotelierJobPost_controller_1 = __importDefault(require("../controller/hotelierJobPost.controller"));
class HotelierJobPostRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new hotelierJobPost_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .post(this.controller.createJobPost)
            .get(this.controller.getJobPostList);
        this.router
            .route("/track/:id")
            .get(this.controller.trackJobSeekerLocation);
        this.router
            .route("/:id")
            .get(this.controller.getSingleJobPostForHotelier)
            .patch(this.controller.updateJobPost)
            .delete(this.controller.cancelJobPost);
    }
}
exports.default = HotelierJobPostRouter;
