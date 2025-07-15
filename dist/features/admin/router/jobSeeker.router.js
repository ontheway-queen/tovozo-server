"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const jobSeeker_controller_1 = __importDefault(require("../controller/jobSeeker.controller"));
class AdminJobSeekerRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new jobSeeker_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .get(this.controller.getJobSeekers)
            .post(this.uploader.cloudUploadRaw(this.fileFolders.JOB_SEEKER_FILES), this.controller.createJobSeeker);
        this.router
            .route("/:id")
            .get(this.controller.getSingleJobSeeker)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.JOB_SEEKER_FILES), this.controller.updateJobSeeker)
            .delete(this.controller.deleteJobSeeker);
    }
}
exports.default = AdminJobSeekerRouter;
