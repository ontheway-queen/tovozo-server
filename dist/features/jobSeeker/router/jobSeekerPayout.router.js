"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const jobSeekerPayout_controller_1 = __importDefault(require("../controller/jobSeekerPayout.controller"));
class JobSeekerPayoutRoute extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new jobSeekerPayout_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .post(this.controller.requestForPayout)
            .get(this.controller.getPayoutsForJobSeeker);
        this.router.route("/:id").get(this.controller.getSinglePayout);
    }
}
exports.default = JobSeekerPayoutRoute;
