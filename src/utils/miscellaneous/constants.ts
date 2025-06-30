export const origin: string[] = [
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
export const OTP_TYPES = {
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
export const PROJECT_NAME = "Tovozo";
export const PROJECT_LOGO =
	"https://m360ict-data.s3.ap-south-1.amazonaws.com/tovozo-storage/main/logo.png";
export const PROJECT_ICON =
	"https://m360ict-data.s3.ap-south-1.amazonaws.com/tovozo-storage/main/logo.png";
export const PLAY_STORE_ICON =
	"https://m360ict-data.s3.ap-south-1.amazonaws.com/tovozo-storage/main/play-store.webp";
export const APP_STORE_ICON =
	"https://m360ict-data.s3.ap-south-1.amazonaws.com/tovozo-storage/main/app-store.png";

export const PROJECT_LINK = "http://10.10.220.31:3000";
export const PROJECT_EMAIL = "sup.m360ict@gmail.com";
export const PROJECT_NUMBER = "+8801958398339";
export const PROJECT_ADDRESS = "Block#H, Road#7, House#74, Banani, Dhaka";

export const CLIENT_URL = "http://10.10.220.47:5000";

export const HOTELIER_APP_STORE_URL =
	"https://apps.apple.com/us/app/m-360/id1365604081";
export const HOTELIER_PLAY_STORE_URL =
	"https://play.google.com/store/apps/dev?id=8957568887029131075&hl=en";

export const JOB_SEEKER_APP_STORE_URL =
	"https://apps.apple.com/us/app/m-360/id1365604081";
export const JOB_SEEKER_PLAY_STORE_URL =
	"https://play.google.com/store/apps/dev?id=8957568887029131075&hl=en";

// Email subject
export const OTP_EMAIL_SUBJECT = "Your One Time Password For Verification";

// Default data get limit
export const DATA_LIMIT = 100;
export const OTP_DEFAULT_EXPIRY = 3;

//error logs level
export const ERROR_LEVEL_DEBUG = "DEBUG";
export const ERROR_LEVEL_INFO = "INFO";
export const ERROR_LEVEL_WARNING = "WARNING";
export const ERROR_LEVEL_ERROR = "ERROR";
export const ERROR_LEVEL_CRITICAL = "CRITICAL";

//panel source
export const SOURCE_AGENT = "AGENT";
export const SOURCE_SUB_AGENT = "SUB AGENT";
export const SOURCE_AGENT_B2C = "AGENT B2C";
export const SOURCE_B2C = "B2C";
export const SOURCE_EXTERNAL = "EXTERNAL";
export const SOURCE_ADMIN = "ADMIN";

// // OTP types constants
export const OTP_TYPE_FORGET_ADMIN = "reset_admin";
export const OTP_TYPE_FORGET_JOB_SEEKER = "reset_job_seeker";
export const OTP_TYPE_VERIFY_JOB_SEEKER = "verify_job_seeker";
export const OTP_TYPE_VERIFY_HOTELIER = "verify_hotelier";
export const OTP_TYPE_VERIFY_ADMIN = "verify_admin";
export const OTP_TYPE_FORGET_HOTELIER = "reset_hotelier";
export const OTP_TYPE_TWO_FA_JOB_SEEKER = "2fa_job_seeker";
export const OTP_TYPE_TWO_FA_ADMIN = "2fa_admin";
export const OTP_TYPE_TWO_FA_HOTELIER = "2fa_hotelier";

export const USER_STATUS = {
	ACTIVE: "active",
	INACTIVE: "inactive",
	PENDING: "pending",
	BLOCKED: "blocked",
	UNDER_REVIEW: "under-review",
} as const;

export const USER_STATUS_ENUM = [
	"active",
	"inactive",
	"pending",
	"blocked",
	"under-review",
] as const;

export const USER_AUTHENTICATION_VIEW = {
	JOB_SEEKER: "vw_job_seeker_auth",
	HOTELIER: "vw_hotelier_auth",
	ADMIN: "vw_admin_auth",
} as const;

export const USER_TYPE = {
	JOB_SEEKER: "JOB_SEEKER",
	HOTELIER: "HOTELIER",
	ADMIN: "ADMIN",
} as const;

// OTP for
export const OTP_FOR = "Verification";

// British ID
export const BRITISH_ID = 26;

// Token Expiration time
export const LOGIN_TOKEN_EXPIRES_IN = "14d";

// Gender
export const GENDERS = ["Male", "Female", "Other"] as const;

// Job post details status
export const JOB_POST_DETAILS_STATUS = {
	Pending: "Pending",
	Applied: "Applied",
	Expired: "Expired",
	Completed: "Completed",
	WorkFinished: "Work Finished",
	Cancelled: "Cancelled",
} as const;

export const JOB_POST_DETAILS_STATUS_ENUM = [
	"Pending",
	"Applied",
	"Expired",
	"Completed",
	"Work Finished",
	"Cancelled",
] as const;

export const GENDER_TYPE = {
	Male: "Male",
	Female: "Female",
	Other: "Other",
} as const;

export const CANCEL_JOB_POST_ENUM = ["CANCEL_JOB_POST"] as const;

export const CANCEL_APPLICATION_ENUM = ["CANCEL_APPLICATION"] as const;

export const CANCELLATION_REPORT_TYPE_ENUM = [
	"CANCEL_JOB_POST",
	"CANCEL_APPLICATION",
] as const;

export const CANCELLATION_REPORT_TYPE = {
	CANCEL_JOB_POST: "CANCEL_JOB_POST",
	CANCEL_APPLICATION: "CANCEL_APPLICATION",
} as const;

export const CANCELLATION_REPORT_STATUS_ENUM = [
	"PENDING",
	"APPROVED",
	"REJECTED",
	"CANCELLED",
] as const;

export const CANCELLATION_REPORT_STATUS = {
	PENDING: "PENDING",
	APPROVED: "APPROVED",
	REJECTED: "REJECTED",
	CANCELLED: "CANCELLED",
};

export const JOB_APPLICATION_STATUS = {
	PENDING: "PENDING",
	ASSIGNED: "ASSIGNED",
	CANCELLED: "CANCELLED",
	COMPLETED: "COMPLETED",
	IN_PROGRESS: "IN_PROGRESS",
	ENDED: "ENDED",
} as const;

export const JOB_APPLICATION_STATUS_ENUM = [
	"PENDING",
	"ASSIGNED",
	"CANCELLED",
	"COMPLETED",
	"IN_PROGRESS",
	"ENDED",
];

export const PAYMENT_STATUS = {
	UNPAID: "UNPAID",
	PAID: "PAID",
	FAILED: "FAILED",
	PARTIAL_PAID: "PARTIAL_PAID",
} as const;

export const PAYMENT_STATUS_ENUM = [
	"UNPAID",
	"PAID",
	"FAILED",
	"PARTIAL_PAID",
] as const;

export const REPORT_TYPE = {
	TaskActivity: "TaskActivity",
	JobPost: "JobPost",
} as const;

export const REPORT_TYPE_ENUM = ["TaskActivity", "JobPost"] as const;

export const REPORT_STATUS = {
	Pending: "Pending",
	Reviewed: "Reviewed",
	Resolved: "Resolved",
	Rejected: "Rejected",
} as const;

export const REPORT_STATUS_ENUM = [
	"Pending",
	"Reviewed",
	"Resolved",
	"Rejected",
] as const;
