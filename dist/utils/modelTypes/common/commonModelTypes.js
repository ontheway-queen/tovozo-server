"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeEmitNotification = exports.NotificationTypeEnum = void 0;
var NotificationTypeEnum;
(function (NotificationTypeEnum) {
    NotificationTypeEnum["JOB_MATCH"] = "JOB_MATCH";
    NotificationTypeEnum["REMINDER"] = "REMINDER";
    NotificationTypeEnum["APPLICATION_UPDATE"] = "APPLICATION_UPDATE";
    NotificationTypeEnum["PAYMENT"] = "PAYMENT";
    NotificationTypeEnum["CANCELLATION"] = "CANCELLATION";
    NotificationTypeEnum["JOB_SEEKER_VERIFICATION"] = "JOB_SEEKER_VERIFICATION";
    NotificationTypeEnum["HOTELIER_VERIFICATION"] = "HOTELIER_VERIFICATION";
    NotificationTypeEnum["SECURITY_ALERT"] = "SECURITY_ALERT";
    NotificationTypeEnum["SYSTEM_UPDATE"] = "SYSTEM_UPDATE";
})(NotificationTypeEnum || (exports.NotificationTypeEnum = NotificationTypeEnum = {}));
var TypeEmitNotification;
(function (TypeEmitNotification) {
    TypeEmitNotification[TypeEmitNotification["ADMIN_NEW_NOTIFICATION"] = 0] = "ADMIN_NEW_NOTIFICATION";
    TypeEmitNotification[TypeEmitNotification["HOTELIER_NEW_NOTIFICATION"] = 1] = "HOTELIER_NEW_NOTIFICATION";
    TypeEmitNotification[TypeEmitNotification["JOB_SEEKER_NEW_NOTIFICATION"] = 2] = "JOB_SEEKER_NEW_NOTIFICATION";
})(TypeEmitNotification || (exports.TypeEmitNotification = TypeEmitNotification = {}));
