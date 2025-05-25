"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const abstract_router_1 = __importDefault(require("../../abstract/abstract.router"));
const auth_jobSeeker_router_1 = __importDefault(require("./router/auth.jobSeeker.router"));
class AuthRootRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.jobSeekerRouter = new auth_jobSeeker_router_1.default();
        this.AuthRouter = (0, express_1.Router)();
        this.callRouter();
    }
    callRouter() {
        //agent auth router
        this.AuthRouter.use("/job-seeker", this.jobSeekerRouter.router);
    }
}
exports.default = AuthRootRouter;
