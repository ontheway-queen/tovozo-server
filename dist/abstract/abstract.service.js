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
const database_1 = require("../app/database");
const socket_1 = require("../app/socket");
const socketService_1 = __importDefault(require("../features/public/services/socketService"));
const rootModel_1 = __importDefault(require("../models/rootModel"));
const manageFile_1 = __importDefault(require("../utils/lib/manageFile"));
const notificationMessage_1 = __importDefault(require("../utils/miscellaneous/notificationMessage"));
const responseMessage_1 = __importDefault(require("../utils/miscellaneous/responseMessage"));
const statusCode_1 = __importDefault(require("../utils/miscellaneous/statusCode"));
const commonModelTypes_1 = require("../utils/modelTypes/common/commonModelTypes");
const userModelTypes_1 = require("../utils/modelTypes/user/userModelTypes");
const queue_1 = require("../utils/queue/queue");
class AbstractServices {
    constructor() {
        this.db = database_1.db;
        this.manageFile = new manageFile_1.default();
        this.ResMsg = responseMessage_1.default;
        this.socketService = new socketService_1.default();
        this.StatusCode = statusCode_1.default;
        this.Model = new rootModel_1.default();
        this.queueManager = queue_1.QueueManager.getInstance();
        this.NotificationMsg = notificationMessage_1.default;
    }
    insertAdminAudit(trx, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const adminModel = this.Model.AdminModel(trx);
            yield adminModel.createAudit(payload);
        });
    }
    // Insert notification
    insertNotification(trx, userType, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!payload.content ||
                !payload.title ||
                !payload.type ||
                !payload.related_id)
                return;
            const commonModel = this.Model.commonModel(trx);
            const notificationPayload = [];
            let users = [];
            switch (userType) {
                case userModelTypes_1.TypeUser.ADMIN: {
                    const admins = yield this.Model.AdminModel(trx).getAllAdmin({}, false);
                    if (admins.data.length) {
                        users = admins.data.map((admin) => ({
                            user_id: admin.user_id,
                        }));
                    }
                    break;
                }
                case userModelTypes_1.TypeUser.JOB_SEEKER: {
                    if (payload.user_id &&
                        (payload.type === commonModelTypes_1.NotificationTypeEnum.JOB_TASK ||
                            payload.type ===
                                commonModelTypes_1.NotificationTypeEnum.APPLICATION_UPDATE ||
                            payload.type === commonModelTypes_1.NotificationTypeEnum.CANCELLATION ||
                            payload.type === commonModelTypes_1.NotificationTypeEnum.JOB_MATCH ||
                            payload.type === commonModelTypes_1.NotificationTypeEnum.JOB_POST ||
                            payload.type === commonModelTypes_1.NotificationTypeEnum.PAYMENT ||
                            payload.type === commonModelTypes_1.NotificationTypeEnum.SECURITY_ALERT ||
                            payload.type === commonModelTypes_1.NotificationTypeEnum.REMINDER ||
                            payload.type === commonModelTypes_1.NotificationTypeEnum.PAYOUT ||
                            payload.type === commonModelTypes_1.NotificationTypeEnum.SYSTEM_UPDATE ||
                            payload.type === "JOB_SEEKER_VERIFICATION")) {
                        users = [{ user_id: payload.user_id }];
                    }
                    else {
                        const seekers = yield this.Model.UserModel(trx).checkUser({
                            type: userModelTypes_1.TypeUser.JOB_SEEKER,
                        });
                        users = seekers.map((u) => ({ user_id: u.id }));
                    }
                    break;
                }
                case userModelTypes_1.TypeUser.HOTELIER: {
                    if (payload.user_id &&
                        (payload.type === commonModelTypes_1.NotificationTypeEnum.JOB_TASK ||
                            payload.type ===
                                commonModelTypes_1.NotificationTypeEnum.APPLICATION_UPDATE ||
                            payload.type === commonModelTypes_1.NotificationTypeEnum.CANCELLATION ||
                            payload.type === commonModelTypes_1.NotificationTypeEnum.JOB_MATCH ||
                            payload.type === commonModelTypes_1.NotificationTypeEnum.JOB_POST ||
                            payload.type === commonModelTypes_1.NotificationTypeEnum.PAYMENT ||
                            payload.type === commonModelTypes_1.NotificationTypeEnum.SECURITY_ALERT ||
                            payload.type === commonModelTypes_1.NotificationTypeEnum.REMINDER ||
                            payload.type === commonModelTypes_1.NotificationTypeEnum.SYSTEM_UPDATE)) {
                        users = [{ user_id: payload.user_id }];
                    }
                    else {
                        const hoteliers = yield this.Model.UserModel(trx).checkUser({
                            type: userModelTypes_1.TypeUser.HOTELIER,
                        });
                        users = hoteliers.map((u) => ({ user_id: u.id }));
                    }
                    break;
                }
                default:
                    return;
            }
            if (!users.length)
                return;
            for (const user of users) {
                notificationPayload.push({
                    user_id: user.user_id,
                    sender_id: payload.sender_id,
                    sender_type: payload.sender_type,
                    title: payload.title,
                    content: payload.content,
                    related_id: payload.related_id,
                    type: payload.type,
                });
            }
            // Emit to online users only
            const socketUsers = yield (0, socket_1.getAllOnlineSocketIds)({ type: userType });
            if (socketUsers.length) {
                const seenUserIds = new Set();
                const emitType = this.getEmitType(userType);
                for (const { user_id, socketId } of socketUsers) {
                    if (seenUserIds.has(user_id))
                        continue;
                    this.socketService.emitNotification({
                        user_id,
                        socketId,
                        sender_id: payload.sender_id,
                        sender_type: payload.sender_type,
                        title: payload.title,
                        content: payload.content,
                        related_id: payload.related_id,
                        type: payload.type,
                        emitType,
                    });
                    seenUserIds.add(user_id);
                }
            }
            yield commonModel.createNotification(notificationPayload);
        });
    }
    getEmitType(userType) {
        switch (userType) {
            case userModelTypes_1.TypeUser.ADMIN:
                return commonModelTypes_1.TypeEmitNotificationEnum.ADMIN_NEW_NOTIFICATION;
            case userModelTypes_1.TypeUser.HOTELIER:
                return commonModelTypes_1.TypeEmitNotificationEnum.HOTELIER_NEW_NOTIFICATION;
            case userModelTypes_1.TypeUser.JOB_SEEKER:
            default:
                return commonModelTypes_1.TypeEmitNotificationEnum.JOB_SEEKER_NEW_NOTIFICATION;
        }
    }
    // Queue
    getQueue(queueName) {
        return this.queueManager.getQueue(queueName);
    }
}
exports.default = AbstractServices;
