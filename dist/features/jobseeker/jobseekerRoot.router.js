"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../abstract/abstract.router"));
const jobSeekerProfile_router_1 = __importDefault(require("./router/jobSeekerProfile.router"));
class JobSeekerRootRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.callRouter();
    }
    callRouter() {
        // profile router
        this.router.use("/profile", new jobSeekerProfile_router_1.default().router);
    }
}
exports.default = JobSeekerRootRouter;
