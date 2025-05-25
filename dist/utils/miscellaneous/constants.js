"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_TYPE = exports.USER_AUTHENTICATION_VIEW = exports.USER_STATUS = exports.SOURCE_ADMIN = exports.SOURCE_EXTERNAL = exports.SOURCE_B2C = exports.SOURCE_AGENT_B2C = exports.SOURCE_SUB_AGENT = exports.SOURCE_AGENT = exports.ERROR_LEVEL_CRITICAL = exports.ERROR_LEVEL_ERROR = exports.ERROR_LEVEL_WARNING = exports.ERROR_LEVEL_INFO = exports.ERROR_LEVEL_DEBUG = exports.OTP_DEFAULT_EXPIRY = exports.DATA_LIMIT = exports.OTP_EMAIL_SUBJECT = exports.PROJECT_ADDRESS = exports.PROJECT_NUMBER = exports.PROJECT_EMAIL = exports.PROJECT_LINK = exports.PROJECT_ICON = exports.PROJECT_LOGO = exports.PROJECT_NAME = exports.OTP_TYPES = exports.origin = void 0;
exports.origin = [
    "http://localhost:3000",
    "http://localhost:5000",
    "http://10.10.220.47:5000",
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
exports.PROJECT_LOGO = "https://m360-trabill.s3.ap-south-1.amazonaws.com/tovozo-storage/main/be_logo.png";
exports.PROJECT_ICON = "https://m360-trabill.s3.ap-south-1.amazonaws.com/tovozo-storage/main/be_icon.png";
exports.PROJECT_LINK = "http://10.10.220.31:3000";
exports.PROJECT_EMAIL = "sup.m360ict@gmail.com";
exports.PROJECT_NUMBER = "+8801958398339";
exports.PROJECT_ADDRESS = "Block#H, Road#7, House#74, Banani, Dhaka";
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
