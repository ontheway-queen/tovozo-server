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
const dayjs_1 = __importDefault(require("dayjs"));
const constants_1 = require("../../utils/miscellaneous/constants");
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class StatisticsModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    generateAdminStatistic(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from, to } = query;
            const today = new Date();
            const now = (0, dayjs_1.default)();
            const sixMonthsAgo = now.subtract(5, "month").startOf("month").toDate();
            const [jobSeekersData, hoteliersData, jobPostsData, paymentStats, reportStats, latestApplications, paymentChart,] = yield Promise.all([
                // Job seekers
                this.db("job_seeker as js")
                    .withSchema(this.JOB_SEEKER)
                    .select(this.db.raw("COUNT(*) AS total"), this.db.raw("SUM(CASE WHEN account_status = 'Pending' THEN 1 ELSE 0 END) AS pending"), this.db.raw("SUM(CASE WHEN account_status = 'Inactive' THEN 1 ELSE 0 END) AS inactive"))
                    .first(),
                // Hoteliers
                this.db("organization as org")
                    .withSchema(this.HOTELIER)
                    .select(this.db.raw("COUNT(*) AS total"), this.db.raw("SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending"), this.db.raw("SUM(CASE WHEN status = 'Inactive' THEN 1 ELSE 0 END) AS inactive"))
                    .first(),
                // Job posts
                this.db("job_post as jp")
                    .withSchema(this.DBO_SCHEMA)
                    .select(this.db.raw("COUNT(*) AS total"), this.db.raw("SUM(CASE WHEN status = 'Live' THEN 1 ELSE 0 END) AS active"), this.db.raw("SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled"))
                    .first(),
                // Payments
                this.db("payment as p")
                    .withSchema(this.DBO_SCHEMA)
                    .select(this.db.raw("SUM(total_amount) AS total"), this.db.raw("SUM(CASE WHEN status = 'Paid' THEN total_amount ELSE 0 END) AS paid"), this.db.raw("SUM(CASE WHEN status = 'Unpaid' THEN total_amount ELSE 0 END) AS pending"), this.db.raw("COUNT(DISTINCT CASE WHEN status = 'Paid' THEN application_id ELSE NULL END) AS successful_hires"))
                    .first(),
                // Reports
                this.db("reports as r")
                    .withSchema(this.DBO_SCHEMA)
                    .select(this.db.raw("SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending"))
                    .first(),
                // Latest applications
                this.db("job_applications as ja")
                    .withSchema(this.DBO_SCHEMA)
                    .select("ja.id", "ja.job_post_details_id", "j.title as job_title", "ja.job_seeker_id", "jsu.name as job_seeker_name", "jsu.photo as job_seeker_photo", "ja.status", "ja.created_at")
                    .leftJoin("job_post_details as jpd", "jpd.id", "ja.job_post_details_id")
                    .leftJoin("jobs as j", "j.id", "jpd.job_id")
                    .leftJoin("user as jsu", "jsu.id", "ja.job_seeker_id")
                    .where("ja.status", "Pending")
                    .orderBy("ja.created_at", "desc")
                    .limit(5),
                // Payment chart (last 6 months)
                this.db("payment")
                    .withSchema(this.DBO_SCHEMA)
                    .select(this.db.raw(`TO_CHAR(DATE_TRUNC('month', paid_at), 'YYYY-MM-DD') AS month`), this.db.raw(`SUM(total_amount) AS hotelier_paid`), this.db.raw(`SUM(job_seeker_pay) AS job_seeker_get`), this.db.raw(`SUM(platform_fee) AS admin_earned`))
                    .where("status", "Paid")
                    .andWhere("paid_at", ">=", sixMonthsAgo)
                    .groupByRaw(`DATE_TRUNC('month', paid_at)`)
                    .orderByRaw(`DATE_TRUNC('month', paid_at) DESC`),
            ]);
            return {
                jobSeekers: {
                    total: Number(jobSeekersData.total),
                    new: yield this.countNewUsers(constants_1.USER_TYPE.JOB_SEEKER, today),
                    pending: Number(jobSeekersData.pending),
                    inactive: Number(jobSeekersData.inactive),
                },
                hoteliers: {
                    total: Number(hoteliersData.total),
                    new: yield this.countNewUsers(constants_1.USER_TYPE.HOTELIER, today),
                    pending: Number(hoteliersData.pending),
                    inactive: Number(hoteliersData.inactive),
                },
                jobPosts: {
                    total: Number(jobPostsData.total),
                    active: Number(jobPostsData.active),
                    cancelled: Number(jobPostsData.cancelled),
                },
                successfulHires: Number(paymentStats.successful_hires),
                payments: {
                    total: Number(paymentStats.total || 0),
                    paid: Number(paymentStats.paid || 0),
                    pending: Number(paymentStats.pending || 0),
                },
                reports: {
                    pending: Number(reportStats.pending),
                },
                latestApplications,
                rows: paymentChart,
            };
        });
    }
    // Helper to count today's new users
    countNewUsers(type, today) {
        return __awaiter(this, void 0, void 0, function* () {
            const start = (0, dayjs_1.default)(today).startOf("day").toDate();
            const end = (0, dayjs_1.default)(today).endOf("day").toDate();
            const [result] = yield this.db("user")
                .withSchema(this.DBO_SCHEMA)
                .where("type", type)
                .andWhere("created_at", ">=", start)
                .andWhere("created_at", "<=", end)
                .count("id as total");
            return Number(result.total);
        });
    }
}
exports.default = StatisticsModel;
