"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const adminChatController_1 = __importDefault(require("../controller/adminChatController"));
class AdminChatRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminChatController_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/session")
            .post(this.controller.createChatSession)
            .get(this.controller.getChatSession);
        this.router.route("/message").post(this.controller.createChatMessage);
        this.router.route("/message/:id").get(this.controller.getChatMessages);
    }
}
exports.default = AdminChatRouter;
