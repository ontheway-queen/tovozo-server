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
            const commonModel = this.Model.commonModel(trx);
            const notificationPayload = [];
            if (userType === userModelTypes_1.TypeUser.ADMIN) {
                const getAllAdmin = yield this.Model.AdminModel(trx).getAllAdmin({}, false);
                if (!getAllAdmin.data.length) {
                    for (const admin of getAllAdmin.data) {
                        notificationPayload.push({
                            user_id: admin.user_id,
                            content: payload.content,
                            related_id: payload.related_id,
                            type: payload.type,
                        });
                    }
                }
                const getAllAdminSocketIds = yield (0, socket_1.getAllOnlineSocketIds)({
                    type: userType,
                });
                if (!getAllAdminSocketIds.length)
                    return;
                const seenUserIds = new Set();
                for (const { user_id, socketId } of getAllAdminSocketIds) {
                    if (seenUserIds.has(user_id)) {
                        this.socketService.emitNotification({
                            user_id,
                            socketId,
                            content: payload.content,
                            related_id: payload.related_id,
                            type: payload.type,
                            emitType: commonModelTypes_1.TypeEmitNotificationEnum.ADMIN_NEW_NOTIFICATION,
                        });
                        continue;
                    }
                    seenUserIds.add(user_id);
                }
            }
            else {
                const getAllUsers = yield this.Model.UserModel(trx).checkUser({
                    type: userType,
                });
                if (!getAllUsers.length) {
                    for (const user of getAllUsers) {
                        notificationPayload.push({
                            user_id: user.id,
                            content: payload.content,
                            related_id: payload.related_id,
                            type: payload.type,
                        });
                    }
                }
                const getUserSocketIds = yield (0, socket_1.getAllOnlineSocketIds)({
                    type: userType,
                });
                if (!getUserSocketIds.length)
                    return;
                for (const { user_id, socketId } of getUserSocketIds) {
                    this.socketService.emitNotification({
                        user_id,
                        socketId,
                        content: payload.content,
                        related_id: payload.related_id,
                        type: payload.type,
                        emitType: userType === userModelTypes_1.TypeUser.HOTELIER
                            ? commonModelTypes_1.TypeEmitNotificationEnum.HOTELIER_NEW_NOTIFICATION
                            : commonModelTypes_1.TypeEmitNotificationEnum.JOB_SEEKER_NEW_NOTIFICATION,
                    });
                }
            }
            if (!notificationPayload.length)
                return;
            yield commonModel.createNotification(notificationPayload);
        });
    }
    // Queue
    getQueue(queueName) {
        return this.queueManager.getQueue(queueName);
    }
}
exports.default = AbstractServices;
