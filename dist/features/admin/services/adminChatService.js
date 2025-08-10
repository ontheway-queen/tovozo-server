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
const socket_1 = require("../../../app/socket");
class AdminChatService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // public async createChatSession(req: Request) {
    //   return await this.db.transaction(async (trx) => {
    //     const { user_id } = req.body as unknown as {
    //       user_id: number;
    //     };
    //     const user1_id = req.admin.user_id;
    //     const user2_id = user_id;
    //     if (user1_id === user2_id) {
    //       return {
    //         success: false,
    //         code: this.StatusCode.HTTP_BAD_REQUEST,
    //         message: "Cannot create chat session with yourself!",
    //       };
    //     }
    //     const model = this.Model.chatModel(trx);
    //     const userModel = this.Model.UserModel(trx);
    //     const checkUser = await userModel.checkUser({ id: user_id });
    //     if (!checkUser.length) {
    //       return {
    //         success: false,
    //         code: this.StatusCode.HTTP_NOT_FOUND,
    //         message: "User not found!",
    //       };
    //     }
    //     if (checkUser[0].type === USER_TYPE.ADMIN) {
    //       return {
    //         success: false,
    //         code: this.StatusCode.HTTP_BAD_REQUEST,
    //         message: "Cannot create chat session with admin!",
    //       };
    //     }
    //     const chatSession = await model.getChatSession({ user1_id, user2_id });
    //     if (chatSession) {
    //       return {
    //         success: true,
    //         code: this.StatusCode.HTTP_SUCCESSFUL,
    //         message: this.ResMsg.HTTP_SUCCESSFUL,
    //         data: chatSession,
    //       };
    //     }
    //     const newChatSession = await model.createChatSession({
    //       user1_id,
    //       user2_id,
    //     });
    //     if (!newChatSession.length) {
    //       return {
    //         success: false,
    //         code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
    //         message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
    //       };
    //     }
    //     return {
    //       success: true,
    //       code: this.StatusCode.HTTP_SUCCESSFUL,
    //       message: this.ResMsg.HTTP_SUCCESSFUL,
    //       data: newChatSession[0],
    //     };
    //   });
    // }
    // public async getChatSession(req: Request) {
    //   const query = req.query as unknown as {
    //     enable_chat: boolean;
    //     limit: number;
    //     skip: number;
    //   };
    //   const { user_id } = req.admin;
    //   const model = this.Model.chatModel();
    //   const chatSession = await model.getChatSessionList({
    //     user_id,
    //     enable_chat: query.enable_chat,
    //     limit: query.limit,
    //     skip: query.skip,
    //   });
    //   return {
    //     success: true,
    //     code: this.StatusCode.HTTP_OK,
    //     message: this.ResMsg.HTTP_OK,
    //     ...chatSession,
    //   };
    // }
    // public async getChatMessages(req: Request) {
    //   const { id } = req.params;
    //   const { limit, skip } = req.query as unknown as {
    //     limit: number;
    //     user_id: number;
    //     skip: number;
    //   };
    //   const { user_id } = req.admin;
    //   const model = this.Model.chatModel();
    //   const chatMessages = await model.getChatMessages({
    //     chat_session_id: Number(id),
    //     user_id,
    //     limit,
    //     skip,
    //   });
    //   return {
    //     success: true,
    //     code: this.StatusCode.HTTP_OK,
    //     message: this.ResMsg.HTTP_OK,
    //     data: chatMessages,
    //   };
    // }
    // public async createChatMessage(req: Request) {
    //   const body = req.body as unknown as ICreateChatMessagePayload;
    //   return await this.db.transaction(async (trx) => {
    //     const model = this.Model.chatModel(trx);
    //     const { user_id } = req.admin;
    //     const checkSession = await model.getChatSession({
    //       id: body.chat_session_id,
    //       user1_id: user_id,
    //       user2_id: body.receiver_id,
    //     });
    //     if (!checkSession) {
    //       return {
    //         success: false,
    //         message: "Chat session not found!",
    //         code: this.StatusCode.HTTP_NOT_FOUND,
    //       };
    //     }
    //     body.sender_id = user_id;
    //     const chatMessage = await model.createChatMessage(body);
    //     if (!chatMessage.length) {
    //       return {
    //         success: false,
    //         code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
    //         message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
    //       };
    //     }
    //     await model.updateChatSession(
    //       {
    //         last_message: body.message,
    //         last_message_at: new Date().toDateString(),
    //       },
    //       { id: body.chat_session_id }
    //     );
    //     return {
    //       success: true,
    //       code: this.StatusCode.HTTP_SUCCESSFUL,
    //       message: this.ResMsg.HTTP_SUCCESSFUL,
    //       data: chatMessage[0],
    //     };
    //   });
    // }
    getChatSessions(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.admin;
            const { name } = req.query;
            const chatModel = this.Model.chatModel();
            const data = yield chatModel.getChatSessions({
                user_id,
                name: String(name),
            });
            console.log({ dataA: data });
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
            const { user_id } = req.admin;
            const session_id = Number(req.query.session_id);
            const chatModel = this.Model.chatModel();
            const data = yield chatModel.getMessages({
                user_id,
                chat_session_id: session_id,
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
            const { user_id } = req.admin;
            const { message, chat_session_id } = req.body;
            console.log({ dataA: req.body });
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const chatModel = this.Model.chatModel(trx);
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
                    message,
                    created_at: newMessage[0].created_at,
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
}
exports.default = AdminChatService;
