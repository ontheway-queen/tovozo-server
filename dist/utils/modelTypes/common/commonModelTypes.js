"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeEmitNotificationEnum = exports.NotificationTypeEnum = void 0;
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
var TypeEmitNotificationEnum;
(function (TypeEmitNotificationEnum) {
    TypeEmitNotificationEnum["ADMIN_NEW_NOTIFICATION"] = "ADMIN_NEW_NOTIFICATION";
    TypeEmitNotificationEnum["HOTELIER_NEW_NOTIFICATION"] = "HOTELIER_NEW_NOTIFICATION";
    TypeEmitNotificationEnum["JOB_SEEKER_NEW_NOTIFICATION"] = "JOB_SEEKER_NEW_NOTIFICATION";
})(TypeEmitNotificationEnum || (exports.TypeEmitNotificationEnum = TypeEmitNotificationEnum = {}));
