"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminRoot_router_1 = __importDefault(require("../features/admin/adminRoot.router"));
const authRoot_router_1 = __importDefault(require("../features/auth/authRoot.router"));
const hotelierRoot_router_1 = __importDefault(require("../features/hotelier/hotelierRoot.router"));
const jobSeekerRoot_router_1 = __importDefault(require("../features/jobSeeker/jobSeekerRoot.router"));
const publicRouter_1 = __importDefault(require("../features/public/router/publicRouter"));
const authChecker_1 = __importDefault(require("../middleware/authChecker/authChecker"));
const jobSeekerStripe_router_1 = __importDefault(require("../features/jobSeeker/router/jobSeekerStripe.router"));
class RootRouter {
    constructor() {
        this.Router = (0, express_1.Router)();
        this.publicRootRouter = new publicRouter_1.default();
        this.authRootRouter = new authRoot_router_1.default();
        this.adminRootRouter = new adminRoot_router_1.default();
        this.hotelierRootRouter = new hotelierRoot_router_1.default();
        this.jobSeekerRootRouter = new jobSeekerRoot_router_1.default();
        this.stripeRouter = new jobSeekerStripe_router_1.default();
        // Auth checker
        this.authChecker = new authChecker_1.default();
        this.callRouter();
    }
    callRouter() {
        // Public Routes
        this.Router.use("/public", this.publicRootRouter.router);
        // Auth Routes
        this.Router.use("/auth", this.authRootRouter.AuthRouter);
        // Admin Routes
        this.Router.use("/admin", this.authChecker.adminAuthChecker, this.adminRootRouter.Router);
        // Job Seeker Routes
        this.Router.use("/job-seeker", this.authChecker.jobSeekerAuthChecker, this.jobSeekerRootRouter.router);
        // Hotelier Routes
        this.Router.use("/hotelier", this.authChecker.hotelierAuthChecker, this.hotelierRootRouter.router);
        // stripe
        this.Router.use("/stripe", this.stripeRouter.router);
    }
}
exports.default = RootRouter;
