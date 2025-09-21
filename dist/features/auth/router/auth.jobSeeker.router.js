"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const auth_jobSeeker_controller_1 = __importDefault(require("../controller/auth.jobSeeker.controller"));
class JobSeekerAuthRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new auth_jobSeeker_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        //register
        this.router.route("/registration").post(this.uploader.cloudUploadRaw(this.fileFolders.JOB_SEEKER_FILES), 
        // this.authChecker.jobSeekerAuthChecker,
        this.controller.registration);
        //login
        this.router.route("/login").post(this.controller.login);
        this.router.route("/login-data").post(this.controller.LoginData);
        //forget password
        this.router.route("/forget-password").post(this.controller.forgetPassword);
    }
}
exports.default = JobSeekerAuthRouter;
