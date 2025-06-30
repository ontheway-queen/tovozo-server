"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CANCEL_JOB_POST_ENUM = exports.GENDER_TYPE = exports.JOB_POST_DETAILS_STATUS_ENUM = exports.JOB_POST_DETAILS_STATUS = exports.GENDERS = exports.LOGIN_TOKEN_EXPIRES_IN = exports.BRITISH_ID = exports.OTP_FOR = exports.USER_TYPE = exports.USER_AUTHENTICATION_VIEW = exports.USER_STATUS = exports.OTP_TYPE_TWO_FA_HOTELIER = exports.OTP_TYPE_TWO_FA_ADMIN = exports.OTP_TYPE_TWO_FA_JOB_SEEKER = exports.OTP_TYPE_FORGET_HOTELIER = exports.OTP_TYPE_VERIFY_ADMIN = exports.OTP_TYPE_VERIFY_HOTELIER = exports.OTP_TYPE_VERIFY_JOB_SEEKER = exports.OTP_TYPE_FORGET_JOB_SEEKER = exports.OTP_TYPE_FORGET_ADMIN = exports.SOURCE_ADMIN = exports.SOURCE_EXTERNAL = exports.SOURCE_B2C = exports.SOURCE_AGENT_B2C = exports.SOURCE_SUB_AGENT = exports.SOURCE_AGENT = exports.ERROR_LEVEL_CRITICAL = exports.ERROR_LEVEL_ERROR = exports.ERROR_LEVEL_WARNING = exports.ERROR_LEVEL_INFO = exports.ERROR_LEVEL_DEBUG = exports.OTP_DEFAULT_EXPIRY = exports.DATA_LIMIT = exports.OTP_EMAIL_SUBJECT = exports.JOB_SEEKER_PLAY_STORE_URL = exports.JOB_SEEKER_APP_STORE_URL = exports.HOTELIER_PLAY_STORE_URL = exports.HOTELIER_APP_STORE_URL = exports.CLIENT_URL = exports.PROJECT_ADDRESS = exports.PROJECT_NUMBER = exports.PROJECT_EMAIL = exports.PROJECT_LINK = exports.APP_STORE_ICON = exports.PLAY_STORE_ICON = exports.PROJECT_ICON = exports.PROJECT_LOGO = exports.PROJECT_NAME = exports.OTP_TYPES = exports.origin = void 0;
exports.JOB_APPLICATION_STATUS_ENUM = exports.JOB_APPLICATION_STATUS = exports.CANCELLATION_REPORT_STATUS = exports.CANCELLATION_REPORT_STATUS_ENUM = exports.REPORT_TYPE = exports.REPORT_TYPE_ENUM = exports.CANCEL_APPLICATION_ENUM = void 0;
exports.origin = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:5000",
    "http://10.10.220.47:5000",
    "http://10.10.220.46:3000",
    "http://10.10.220.46:3001",
    "http://10.10.220.46:3002",
];
// OTP types constants
exports.OTP_TYPES = {
    reset_admin: "reset_admin",
    verify_admin: "verify_admin",
    reset_hotel: "reset_hotel",
    verify_hotel: "verify_hotel",
    register_hotel: "register_hotel",
    reset_job_seeker: "reset_job_seeker",
    verify_job_seeker: "verify_job_seeker",
    register_job_seeker: "register_job_seeker",
};
//Project Info
exports.PROJECT_NAME = "Tovozo";
exports.PROJECT_LOGO = "https://m360ict-data.s3.ap-south-1.amazonaws.com/tovozo-storage/main/logo.png";
exports.PROJECT_ICON = "https://m360ict-data.s3.ap-south-1.amazonaws.com/tovozo-storage/main/logo.png";
exports.PLAY_STORE_ICON = "https://m360ict-data.s3.ap-south-1.amazonaws.com/tovozo-storage/main/play-store.webp";
exports.APP_STORE_ICON = "https://m360ict-data.s3.ap-south-1.amazonaws.com/tovozo-storage/main/app-store.png";
exports.PROJECT_LINK = "http://10.10.220.31:3000";
exports.PROJECT_EMAIL = "sup.m360ict@gmail.com";
exports.PROJECT_NUMBER = "+8801958398339";
exports.PROJECT_ADDRESS = "Block#H, Road#7, House#74, Banani, Dhaka";
exports.CLIENT_URL = "http://10.10.220.47:5000";
exports.HOTELIER_APP_STORE_URL = "https://apps.apple.com/us/app/m-360/id1365604081";
exports.HOTELIER_PLAY_STORE_URL = "https://play.google.com/store/apps/dev?id=8957568887029131075&hl=en";
exports.JOB_SEEKER_APP_STORE_URL = "https://apps.apple.com/us/app/m-360/id1365604081";
exports.JOB_SEEKER_PLAY_STORE_URL = "https://play.google.com/store/apps/dev?id=8957568887029131075&hl=en";
// Email subject
exports.OTP_EMAIL_SUBJECT = "Your One Time Password For Verification";
// Default data get limit
exports.DATA_LIMIT = 100;
exports.OTP_DEFAULT_EXPIRY = 3;
//error logs level
exports.ERROR_LEVEL_DEBUG = "DEBUG";
exports.ERROR_LEVEL_INFO = "INFO";
exports.ERROR_LEVEL_WARNING = "WARNING";
exports.ERROR_LEVEL_ERROR = "ERROR";
exports.ERROR_LEVEL_CRITICAL = "CRITICAL";
//panel source
exports.SOURCE_AGENT = "AGENT";
exports.SOURCE_SUB_AGENT = "SUB AGENT";
exports.SOURCE_AGENT_B2C = "AGENT B2C";
exports.SOURCE_B2C = "B2C";
exports.SOURCE_EXTERNAL = "EXTERNAL";
exports.SOURCE_ADMIN = "ADMIN";
// // OTP types constants
exports.OTP_TYPE_FORGET_ADMIN = "reset_admin";
exports.OTP_TYPE_FORGET_JOB_SEEKER = "reset_job_seeker";
exports.OTP_TYPE_VERIFY_JOB_SEEKER = "verify_job_seeker";
exports.OTP_TYPE_VERIFY_HOTELIER = "verify_hotelier";
exports.OTP_TYPE_VERIFY_ADMIN = "verify_admin";
exports.OTP_TYPE_FORGET_HOTELIER = "reset_hotelier";
exports.OTP_TYPE_TWO_FA_JOB_SEEKER = "2fa_job_seeker";
exports.OTP_TYPE_TWO_FA_ADMIN = "2fa_admin";
exports.OTP_TYPE_TWO_FA_HOTELIER = "2fa_hotelier";
exports.USER_STATUS = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    PENDING: "pending",
    BLOCKED: "blocked",
    UNDER_REVIEW: "under-review",
};
exports.USER_AUTHENTICATION_VIEW = {
    JOB_SEEKER: "vw_job_seeker_auth",
    HOTELIER: "vw_hotelier_auth",
    ADMIN: "vw_admin_auth",
};
exports.USER_TYPE = {
    JOB_SEEKER: "JOB_SEEKER",
    HOTELIER: "HOTELIER",
    ADMIN: "ADMIN",
};
// OTP for
exports.OTP_FOR = "Verification";
// British ID
exports.BRITISH_ID = 26;
// Token Expiration time
exports.LOGIN_TOKEN_EXPIRES_IN = "14d";
// Gender
exports.GENDERS = ["Male", "Female", "Other"];
// Job post details status
exports.JOB_POST_DETAILS_STATUS = {
    Pending: "Pending",
    Applied: "Applied",
    Expired: "Expired",
    Completed: "Completed",
    WorkFinished: "Work Finished",
    Cancelled: "Cancelled",
};
exports.JOB_POST_DETAILS_STATUS_ENUM = [
    "Pending",
    "Applied",
    "Expired",
    "Completed",
    "Work Finished",
    "Cancelled",
];
exports.GENDER_TYPE = {
    Male: "Male",
    Female: "Female",
    Other: "Other",
};
exports.CANCEL_JOB_POST_ENUM = ["CANCEL_JOB_POST"];
exports.CANCEL_APPLICATION_ENUM = ["CANCEL_APPLICATION"];
exports.REPORT_TYPE_ENUM = [
    "CANCEL_JOB_POST",
    "CANCEL_APPLICATION",
];
exports.REPORT_TYPE = {
    CANCEL_JOB_POST: "CANCEL_JOB_POST",
    CANCEL_APPLICATION: "CANCEL_APPLICATION",
};
exports.CANCELLATION_REPORT_STATUS_ENUM = [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "CANCELLED",
];
exports.CANCELLATION_REPORT_STATUS = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    CANCELLED: "CANCELLED",
};
exports.JOB_APPLICATION_STATUS = {
    PENDING: "PENDING",
    ASSIGNED: "ASSIGNED",
    CANCELLED: "CANCELLED",
    COMPLETED: "COMPLETED",
};
exports.JOB_APPLICATION_STATUS_ENUM = [
    "PENDING",
    "ASSIGNED",
    "CANCELLED",
    "COMPLETED",
];
