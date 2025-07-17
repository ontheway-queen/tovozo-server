"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
class MessageService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createChatSession(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user1_id, user2_id } = req.body;
            const model = this.Model.chatModel();
            const chatSession = yield model.getChatSession({ user1_id, user2_id });
            if (chatSession) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: chatSession,
                };
            }
            const newChatSession = yield model.createChatSession({
                user1_id,
                user2_id,
            });
            if (!newChatSession.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                    message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: this.ResMsg.HTTP_SUCCESSFUL,
                data: newChatSession[0],
            };
        });
    }
    getChatSession(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const model = this.Model.chatModel();
            const chatSession = yield model.getChatSessionList(query);
            return Object.assign({ success: true, code: this.StatusCode.HTTP_OK, message: this.ResMsg.HTTP_OK }, chatSession);
        });
    }
    getChatSessionForAdmin(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const model = this.Model.chatModel();
            const chatSession = yield model.getChatSessionListForAdmin(query);
            return Object.assign({ success: true, code: this.StatusCode.HTTP_OK, message: this.ResMsg.HTTP_OK }, chatSession);
        });
    }
    getChatMessages(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { limit, skip } = req.query;
            const model = this.Model.chatModel();
            const chatMessages = yield model.getChatMessages({
                chat_session_id: Number(id),
                limit,
                skip,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: chatMessages,
            };
        });
    }
    createChatMessage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.chatModel(trx);
                const checkSession = yield model.getChatSession({
                    id: body.chat_session_id,
                });
                if (!checkSession) {
                    return {
                        success: false,
                        message: "Chat session not found!",
                        code: this.StatusCode.HTTP_NOT_FOUND,
                    };
                }
                const checkSessionUser = yield model.getChatSession({
                    user1_id: body.sender_id,
                    user2_id: body.receiver_id,
                });
                if (!checkSessionUser) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Chat session not found!",
                    };
                }
                const chatMessage = yield model.createChatMessage(body);
                if (!chatMessage.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                        message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
                    };
                }
                yield model.updateChatSession({
                    last_message: body.message,
                    last_message_at: new Date().toDateString(),
                }, { id: body.chat_session_id });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: chatMessage[0],
                };
            }));
        });
    }
}
exports.default = MessageService;
