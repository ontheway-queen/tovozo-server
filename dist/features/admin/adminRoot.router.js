"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const administration_router_1 = __importDefault(require("./router/administration.router"));
class AdminRootRouter {
    constructor() {
        this.Router = (0, express_1.Router)();
        this.AdminAdministrationRouter = new administration_router_1.default();
        this.callRouter();
    }
    callRouter() {
        //administration
        this.Router.use("/administration", this.AdminAdministrationRouter.router);
    }
}
exports.default = AdminRootRouter;
