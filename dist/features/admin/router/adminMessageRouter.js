"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const adminMessageController_1 = __importDefault(require("../controller/adminMessageController"));
class AdminChatRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminMessageController_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/session").post(this.controller.createChatSession);
        this.router.route("/session").get(this.controller.getChatSession);
        this.router.route("/message").post(this.controller.createChatMessage);
        this.router.route("/message/:id").get(this.controller.getChatMessages);
    }
}
exports.default = AdminChatRouter;
