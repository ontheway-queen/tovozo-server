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
const database_1 = require("../../../app/database");
const socket_1 = require("../../../app/socket");
const rootModel_1 = __importDefault(require("../../../models/rootModel"));
const lib_1 = __importDefault(require("../../lib/lib"));
const commonModelTypes_1 = require("../../modelTypes/common/commonModelTypes");
const userModelTypes_1 = require("../../modelTypes/user/userModelTypes");
class ChatWorker {
    createChatSession(job) {
        return __awaiter(this, void 0, void 0, function* () {
            const { hotelier_id, job_seeker_id } = job.data;
            return yield database_1.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const chatModel = new rootModel_1.default().chatModel(trx);
                const existingSession = yield chatModel.checkSessionForJobSeekerAndHotelier({
                    hotelier_id,
                    job_seeker_id,
                });
                if (existingSession) {
                    yield chatModel.updateChatSession({
                        session_id: existingSession.id,
                        payload: {
                            last_message: "Welcome back! You can continue your conversation here.",
                            last_message_at: new Date(),
                            enable_chat: true,
                        },
                    });
                    return;
                }
                const [session] = yield chatModel.createChatSession({
                    last_message: "Hi there! Feel free to start the conversation here.",
                });
                const chatSessionParticipants = [
                    {
                        chat_session_id: session.id,
                        user_id: hotelier_id,
                        type: userModelTypes_1.TypeUser.HOTELIER,
                        joined_at: new Date(),
                    },
                    {
                        chat_session_id: session.id,
                        user_id: job_seeker_id,
                        type: userModelTypes_1.TypeUser.JOB_SEEKER,
                        joined_at: new Date(),
                    },
                ];
                yield chatModel.createChatSessionParticipants(chatSessionParticipants);
                const messagePayload = {
                    chat_session_id: session.id,
                    sender_id: hotelier_id,
                    message: "Hi there! Feel free to start the conversation here.",
                };
                yield chatModel.sendMessage(messagePayload);
                const isJobSeekerOnline = yield (0, socket_1.getAllOnlineSocketIds)({
                    user_id: job_seeker_id,
                    type: userModelTypes_1.TypeUser.JOB_SEEKER,
                });
                if (isJobSeekerOnline && isJobSeekerOnline.length > 0) {
                    socket_1.io.to(String(job_seeker_id)).emit(commonModelTypes_1.TypeEmitNotificationEnum.JOB_SEEKER_NEW_NOTIFICATION, {
                        user_id: job_seeker_id,
                        type: commonModelTypes_1.NotificationTypeEnum.JOB_TASK,
                        title: "New Message",
                        content: "Hi there! Feel free to start the conversation here.",
                        read_status: false,
                        created_at: new Date().toISOString(),
                    });
                }
                else {
                    const userModel = new rootModel_1.default().UserModel(trx);
                    const checkUser = yield userModel.checkUser({
                        id: job_seeker_id,
                    });
                    if (checkUser && checkUser[0].device_id) {
                        yield lib_1.default.sendNotificationToMobile({
                            to: checkUser[0].device_id,
                            notificationTitle: "New Message",
                            notificationBody: "Hi there! Feel free to start the conversation here.",
                            // data: JSON.stringify({
                            // 	photo,
                            // 	related_id,
                            // }),
                        });
                    }
                }
            }));
        });
    }
}
exports.default = ChatWorker;
