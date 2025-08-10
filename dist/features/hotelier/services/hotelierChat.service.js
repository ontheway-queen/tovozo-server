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
exports.HotelierChatService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const socket_1 = require("../../../app/socket");
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
const userModelTypes_1 = require("../../../utils/modelTypes/user/userModelTypes");
class HotelierChatService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getChatSessions(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.hotelier;
            const chatModel = this.Model.chatModel();
            const data = yield chatModel.getChatSessions({ user_id });
            return {
                success: true,
                message: this.ResMsg.HTTP_OK,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    getMessages(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.hotelier;
            const session_id = Number(req.query.session_id);
            const limit = Number(req.query.limit);
            const skip = Number(req.query.skip);
            const chatModel = this.Model.chatModel();
            const data = yield chatModel.getMessages({
                chat_session_id: session_id,
                user_id,
                limit,
                skip,
            });
            return {
                success: true,
                message: this.ResMsg.HTTP_OK,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    sendMessage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.hotelier;
            const { message, chat_session_id } = req.body;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const chatModel = this.Model.chatModel(trx);
                const isSessionExists = yield chatModel.getChatSessionById(chat_session_id);
                if (isSessionExists && !isSessionExists.enable_chat) {
                    throw new customError_1.default("This chat session is closed and no longer accepts new messages.", this.StatusCode.HTTP_FORBIDDEN);
                }
                const messagePayload = {
                    sender_id: user_id,
                    message,
                    chat_session_id,
                };
                const newMessage = yield chatModel.sendMessage(messagePayload);
                yield chatModel.updateChatSession({
                    session_id: chat_session_id,
                    payload: {
                        last_message: message,
                    },
                });
                socket_1.io.to(`chat:${chat_session_id}`).emit("chat:receive", {
                    id: newMessage[0].id,
                    chat_session_id,
                    sender_id: user_id,
                    message,
                    created_at: newMessage[0].created_at,
                    photo: "",
                    content: message,
                    read_status: false,
                });
                return {
                    success: true,
                    message: this.ResMsg.HTTP_OK,
                    code: this.StatusCode.HTTP_OK,
                    data: {
                        id: newMessage[0].id,
                        message,
                        created_at: newMessage[0].created_at,
                    },
                };
            }));
        });
    }
    getSupportSession(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const userModel = this.Model.UserModel();
            const chatModel = this.Model.chatModel();
            const { user_id } = req.hotelier;
            const checkUser = yield userModel.checkUser({ id: user_id });
            if (checkUser && checkUser.length < 1) {
                throw new customError_1.default("User not found!", this.StatusCode.HTTP_NOT_FOUND);
            }
            let chatSession = yield chatModel.checkSupportSession(user_id);
            if (chatSession) {
                const chat_session_id = chatSession.id;
                const existingParticipants = yield chatModel.getSessionParticipants(chat_session_id);
                const existingAdminIds = new Set(existingParticipants
                    .filter((p) => p.type === userModelTypes_1.TypeUser.ADMIN)
                    .map((p) => p.user_id));
                const admins = yield userModel.checkUser({ type: userModelTypes_1.TypeUser.ADMIN });
                const newAdmins = admins.filter((admin) => !existingAdminIds.has(admin.id));
                if (newAdmins.length) {
                    const newAdminParticipants = newAdmins.map((admin) => ({
                        chat_session_id,
                        user_id: admin.id,
                        type: userModelTypes_1.TypeUser.ADMIN,
                        joined_at: new Date(),
                    }));
                    yield chatModel.createChatSessionParticipants(newAdminParticipants);
                }
                return {
                    success: true,
                    message: this.ResMsg.HTTP_OK,
                    code: this.StatusCode.HTTP_OK,
                    data: { chat_session_id },
                };
            }
            const newSession = yield chatModel.createChatSession({});
            const chat_session_id = newSession[0].id;
            yield chatModel.createChatSessionParticipants([
                {
                    chat_session_id,
                    user_id,
                    type: userModelTypes_1.TypeUser.HOTELIER,
                    joined_at: new Date(),
                },
            ]);
            const admins = yield userModel.checkUser({ type: userModelTypes_1.TypeUser.ADMIN });
            if (admins.length) {
                const adminParticipants = admins.map((admin) => ({
                    chat_session_id,
                    user_id: admin.id,
                    type: userModelTypes_1.TypeUser.ADMIN,
                    joined_at: new Date(),
                }));
                yield chatModel.createChatSessionParticipants(adminParticipants);
            }
            return {
                success: true,
                message: this.ResMsg.HTTP_OK,
                code: this.StatusCode.HTTP_OK,
                data: { chat_session_id },
            };
        });
    }
}
exports.HotelierChatService = HotelierChatService;
