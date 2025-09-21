"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const auth_admin_controller_1 = __importDefault(require("../controller/auth.admin.controller"));
class AdminAuthRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new auth_admin_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        //login
        this.router.route("/login").post(this.controller.login);
        this.router.route("/login-data").post(this.controller.loginData);
        //forget password
        this.router.route("/forget-password").post(this.controller.forgetPassword);
    }
}
exports.default = AdminAuthRouter;
