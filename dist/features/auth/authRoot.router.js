"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_jobSeeker_router_1 = __importDefault(require("./router/auth.jobSeeker.router"));
const auth_hotelier_router_1 = __importDefault(require("./router/auth.hotelier.router"));
const auth_admin_router_1 = __importDefault(require("./router/auth.admin.router"));
class AuthRootRouter {
    constructor() {
        this.jobSeekerRouter = new auth_jobSeeker_router_1.default();
        this.hotelierAuthRouter = new auth_hotelier_router_1.default();
        this.adminAuthRouter = new auth_admin_router_1.default();
        this.AuthRouter = (0, express_1.Router)();
        this.callRouter();
    }
    callRouter() {
        // auth routes for job seeker, hotelier, and admin
        this.AuthRouter.use("/job-seeker", this.jobSeekerRouter.router);
        this.AuthRouter.use("/hotelier", this.hotelierAuthRouter.router);
        this.AuthRouter.use("/admin", this.adminAuthRouter.router);
    }
}
exports.default = AuthRootRouter;
