"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const jobSeekerProfile_controller_1 = __importDefault(require("../controller/jobSeekerProfile.controller"));
class jobSeekerProfileRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new jobSeekerProfile_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        // get profile
        this.router
            .route("/")
            .get(this.controller.getProfile)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.JOB_SEEKER_FILES), this.controller.updateProfile);
        // change password
        this.router
            .route("/change-password")
            .post(this.controller.changePassword);
    }
}
exports.default = jobSeekerProfileRouter;
