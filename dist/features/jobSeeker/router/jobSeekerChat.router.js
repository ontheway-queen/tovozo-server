"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobSeekerChatRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const jobSeekerChat_controller_1 = require("../controller/jobSeekerChat.controller");
class JobSeekerChatRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new jobSeekerChat_controller_1.JobSeekerChatController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/chat-sessions")
            .get(this.controller.getChatSessions);
        this.router
            .route("/messages")
            .get(this.controller.getMessages)
            .post(this.controller.sendMessage);
        // For admin
        this.router.route("/support").get(this.controller.getSupportSession);
    }
}
exports.JobSeekerChatRouter = JobSeekerChatRouter;
