"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelierChatRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const hotelierChat_controller_1 = require("../controller/hotelierChat.controller");
class HotelierChatRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new hotelierChat_controller_1.HotelierChatController();
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
        // For admin support
        this.router.route("/support").get(this.controller.getSupportSession);
    }
}
exports.HotelierChatRouter = HotelierChatRouter;
