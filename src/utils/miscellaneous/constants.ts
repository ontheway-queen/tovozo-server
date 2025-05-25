export const origin: string[] = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://10.10.220.47:5000",
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
  "https://m360-trabill.s3.ap-south-1.amazonaws.com/tovozo-storage/main/be_logo.png";
export const PROJECT_ICON =
  "https://m360-trabill.s3.ap-south-1.amazonaws.com/tovozo-storage/main/be_icon.png";
export const PROJECT_LINK = "http://10.10.220.31:3000";
export const PROJECT_EMAIL = "sup.m360ict@gmail.com";
export const PROJECT_NUMBER = "+8801958398339";
export const PROJECT_ADDRESS = "Block#H, Road#7, House#74, Banani, Dhaka";

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

export const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  BLOCKED: "blocked",
  UNDER_REVIEW: "under-review",
} as const;

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
