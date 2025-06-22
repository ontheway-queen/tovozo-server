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
const socketService_1 = __importDefault(require("../features/public/services/socketService"));
const rootModel_1 = __importDefault(require("../models/rootModel"));
const manageFile_1 = __importDefault(require("../utils/lib/manageFile"));
const responseMessage_1 = __importDefault(require("../utils/miscellaneous/responseMessage"));
const statusCode_1 = __importDefault(require("../utils/miscellaneous/statusCode"));
const commonModelTypes_1 = require("../utils/modelTypes/common/commonModelTypes");
const userModelTypes_1 = require("../utils/modelTypes/user/userModelTypes");
class AbstractServices {
    constructor() {
        this.db = database_1.db;
        this.manageFile = new manageFile_1.default();
        this.ResMsg = responseMessage_1.default;
        this.socketService = new socketService_1.default();
        this.StatusCode = statusCode_1.default;
        this.Model = new rootModel_1.default();
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
                const adminModel = this.Model.AdminModel(trx);
                const getAllAdmin = yield adminModel.getAllAdmin({});
                if (!getAllAdmin.data.length) {
                    return;
                }
                for (const admin of getAllAdmin.data) {
                    notificationPayload.push({
                        user_id: admin.user_id,
                        content: payload.content,
                        related_id: payload.related_id,
                        type: payload.type,
                    });
                    this.socketService.emitNotification({
                        socket_id: admin.socket_id,
                        user_id: admin.user_id,
                        content: payload.content,
                        related_id: payload.related_id,
                        type: payload.type,
                        emitType: commonModelTypes_1.TypeEmitNotification.ADMIN_NEW_NOTIFICATION,
                    });
                }
                yield commonModel.createNotification(notificationPayload);
            }
        });
    }
}
exports.default = AbstractServices;
