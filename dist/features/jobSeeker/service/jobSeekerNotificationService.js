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
const constants_1 = require("../../../utils/miscellaneous/constants");
class JobSeekerNotificationService extends abstract_service_1.default {
    getAllNotification(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const user_id = req.jobSeeker.user_id;
            const model = this.Model.commonModel();
            const data = yield model.getNotification(Object.assign(Object.assign({}, req.query), { user_id }));
            return Object.assign({ success: true, message: this.ResMsg.HTTP_OK, code: this.StatusCode.HTTP_OK }, data);
        });
    }
    deleteNotification(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id, id } = req.query;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.commonModel(trx);
                const getMyNotification = yield model.getNotification({
                    id: Number(id),
                    user_id,
                    limit: "1",
                    need_total: false,
                });
                if (!getMyNotification.data.length) {
                    return {
                        success: false,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                    };
                }
                if (getMyNotification.data[0].user_type.toLowerCase() ===
                    constants_1.USER_TYPE.ADMIN.toLowerCase()) {
                    yield this.insertAdminAudit(trx, {
                        details: id
                            ? `Notification ${id} has been deleted`
                            : "All Notification has been deleted.",
                        created_by: user_id,
                        endpoint: req.originalUrl,
                        type: "DELETE",
                    });
                }
                if (id) {
                    yield model.deleteNotification({
                        notification_id: Number(id),
                        user_id,
                    });
                }
                else {
                    const getAllNotification = yield model.getNotification({
                        user_id,
                        limit: "1000",
                        need_total: false,
                    });
                    const payload = getAllNotification.data
                        .filter((notification) => Number.isInteger(notification.id))
                        .map((notification) => ({
                        notification_id: notification.id,
                        user_id,
                    }));
                    if (payload.length) {
                        yield model.deleteNotification(payload);
                    }
                }
                return {
                    success: true,
                    message: this.ResMsg.HTTP_OK,
                    code: this.StatusCode.HTTP_OK,
                };
            }));
        });
    }
    readNotification(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id, id } = req.query;
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.commonModel(trx);
                const getMyNotification = yield model.getNotification({
                    id: Number(id),
                    user_id,
                    limit: "1",
                    need_total: false,
                });
                if (!getMyNotification.data.length) {
                    return {
                        success: false,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                    };
                }
                if (getMyNotification.data[0].user_type.toLowerCase() ===
                    constants_1.USER_TYPE.ADMIN.toLowerCase()) {
                    yield this.insertAdminAudit(trx, {
                        details: id
                            ? `Notification ${id} has been read`
                            : "All Notification has been read.",
                        created_by: user_id,
                        endpoint: req.originalUrl,
                        type: "UPDATE",
                    });
                }
                const data = yield model.readNotification({
                    notification_id: Number(id),
                    user_id,
                });
                return {
                    success: true,
                    message: this.ResMsg.HTTP_OK,
                    code: this.StatusCode.HTTP_OK,
                };
            }));
        });
    }
}
exports.default = JobSeekerNotificationService;
