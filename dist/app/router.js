"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authChecker_1 = __importDefault(require("../middleware/authChecker/authChecker"));
const publicRoot_router_1 = __importDefault(require("../features/public/publicRoot.router"));
const authRoot_router_1 = __importDefault(require("../features/auth/authRoot.router"));
const adminRoot_router_1 = __importDefault(require("../features/admin/adminRoot.router"));
const hotelierRoot_router_1 = __importDefault(require("../features/hotelier/hotelierRoot.router"));
const jobSeekerRoot_router_1 = __importDefault(require("../features/jobSeeker/jobSeekerRoot.router"));
class RootRouter {
    constructor() {
        this.v2Router = (0, express_1.Router)();
        this.publicRootRouter = new publicRoot_router_1.default();
        this.authRootRouter = new authRoot_router_1.default();
        this.adminRootRouter = new adminRoot_router_1.default();
        this.hotelierRootRouter = new hotelierRoot_router_1.default();
        this.jobSeekerRootRouter = new jobSeekerRoot_router_1.default();
        // Auth checker
        this.authChecker = new authChecker_1.default();
        this.callV2Router();
    }
    callV2Router() {
        // Public Routes
        this.v2Router.use('/public', this.publicRootRouter.router);
        // Auth Routes
        this.v2Router.use('/auth', this.authRootRouter.router);
        // Admin Routes
        this.v2Router.use('/admin', this.authChecker.adminAuthChecker, this.adminRootRouter.router);
        // Job Seeker Routes
        this.v2Router.use('/job-seeker', this.authChecker.adminAuthChecker, this.jobSeekerRootRouter.router);
        // Hotelier Routes
        this.v2Router.use('/hotelier', this.authChecker.adminAuthChecker, this.hotelierRootRouter.router);
    }
}
exports.default = RootRouter;
