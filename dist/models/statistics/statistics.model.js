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
            const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0); // last day of previous month
            const finalFrom = from || startOfLastMonth.toISOString().split("T")[0];
            const finalTo = to || endOfLastMonth.toISOString().split("T")[0];
            const dateFilter = (qb, table = "paid_at") => {
                if (from || startOfLastMonth.toISOString())
                    qb.where(table, ">=", from || startOfLastMonth.toISOString());
                if (to || endOfLastMonth.toISOString())
                    qb.where(table, "<=", to || endOfLastMonth.toISOString());
            };
            const [totalJobSeekers] = yield this.db("job_seeker")
                .withSchema(this.JOB_SEEKER)
                // .modify((qb) => dateFilter(qb))
                .count("user_id as total");
            const [totalHoteliers] = yield this.db("organization")
                .withSchema(this.HOTELIER)
                // .modify((qb) => dateFilter(qb))
                .count("user_id as total");
            const [newJobSeekers] = yield this.db("user")
                .withSchema(this.DBO_SCHEMA)
                .whereRaw(`DATE(created_at) = ?`, [today])
                .andWhere("type", constants_1.USER_TYPE.JOB_SEEKER)
                .count("id as total");
            const [newHoteliers] = yield this.db("user")
                .withSchema(this.DBO_SCHEMA)
                .whereRaw(`DATE(created_at) = ?`, [today])
                .andWhere("type", constants_1.USER_TYPE.HOTELIER)
                .count("id as total");
            const [totalJobPosts] = yield this.db("job_post")
                .withSchema(this.DBO_SCHEMA)
                // .modify((qb) => dateFilter(qb))
                .count("id as total");
            const [activeJobPosts] = yield this.db("job_post")
                .withSchema(this.DBO_SCHEMA)
                .where("status", "Live")
                // .modify((qb) => dateFilter(qb))
                .count("id as total");
            const [cancelledJobPosts] = yield this.db("job_post")
                .withSchema(this.DBO_SCHEMA)
                .where("status", "Cancelled")
                // .modify((qb) => dateFilter(qb))
                .count("id as total");
            const [successfulHires] = yield this.db("payment")
                .withSchema(this.DBO_SCHEMA)
                .where("status", "Paid")
                // .modify((qb) => dateFilter(qb))
                .countDistinct("application_id as total");
            const [totalPayments] = yield this.db("payment")
                .withSchema(this.DBO_SCHEMA)
                // .modify((qb) => dateFilter(qb))
                .sum("total_amount as total");
            const [pendingPayments] = yield this.db("payment")
                .withSchema(this.DBO_SCHEMA)
                .where("status", "Unpaid")
                // .modify((qb) => dateFilter(qb))
                .sum("total_amount as total");
            const [paidPayments] = yield this.db("payment")
                .withSchema(this.DBO_SCHEMA)
                .where("status", "Paid")
                // .modify((qb) => dateFilter(qb))
                .sum("total_amount as total");
            const [pendingReports] = yield this.db("reports")
                .withSchema(this.DBO_SCHEMA)
                .where("status", "Pending")
                // .modify((qb) => dateFilter(qb))
                .count("id as total");
            const latestApplications = yield this.db("job_applications as ja")
                .withSchema(this.DBO_SCHEMA)
                .select("ja.id", "ja.job_post_details_id", "j.title as job_title", "ja.job_seeker_id", "jsu.name as job_seeker_name", "jsu.photo as job_seeker_photo", "ja.status", "ja.created_at")
                .leftJoin("job_post_details as jpd", "jpd.id", "ja.job_post_details_id")
                .leftJoin("jobs as j", "j.id", "jpd.job_id")
                .leftJoin("user as jsu", "jsu.id", "ja.job_seeker_id")
                .orderBy("created_at", "desc")
                .where("ja.status", "Pending")
                .limit(5);
            const [pendingJobSeekers] = yield this.db("job_seeker")
                .withSchema(this.JOB_SEEKER)
                .where("account_status", "Pending")
                .count("user_id as total");
            console.log({ pendingJobSeekers });
            const [inactiveJobSeekers] = yield this.db("job_seeker")
                .withSchema(this.JOB_SEEKER)
                .where("account_status", "Inactive")
                .count("user_id as total");
            const [pendingHoteliers] = yield this.db("organization")
                .withSchema(this.HOTELIER)
                .where("status", "Pending")
                .count("user_id as total");
            const [inactiveHoteliers] = yield this.db("organization")
                .withSchema(this.HOTELIER)
                .where("status", "Inactive")
                .count("user_id as total");
            const [lastMonthStats] = yield this.db("payment")
                .withSchema(this.DBO_SCHEMA)
                .where("status", "Paid")
                // .modify((qb) => dateFilter(qb, "paid_at"))
                .sum({
                hotelier_paid: "total_amount",
                job_seeker_get: "job_seeker_pay",
                admin_earned: "platform_fee",
            });
            return {
                jobSeekers: {
                    total: Number(totalJobSeekers.total),
                    new: Number(newJobSeekers.total),
                    pending: Number(pendingJobSeekers.total),
                    inactive: Number(inactiveJobSeekers.total),
                },
                hoteliers: {
                    total: Number(totalHoteliers.total),
                    new: Number(newHoteliers.total),
                    pending: Number(pendingHoteliers.total),
                    inactive: Number(inactiveHoteliers.total),
                },
                jobPosts: {
                    total: Number(totalJobPosts.total),
                    active: Number(activeJobPosts.total),
                    cancelled: Number(cancelledJobPosts.total),
                },
                successfulHires: Number(successfulHires.total),
                payments: {
                    total: Number(totalPayments.total || 0),
                    paid: Number(paidPayments.total || 0),
                    pending: Number(pendingPayments.total || 0),
                },
                reports: {
                    pending: Number(pendingReports.total),
                },
                latestApplications,
                lastMonthFinancials: {
                    hotelier_paid: Number(lastMonthStats.hotelier_paid || 0),
                    job_seeker_get: Number(lastMonthStats.job_seeker_get || 0),
                    admin_earned: Number(lastMonthStats.admin_earned || 0),
                },
            };
        });
    }
}
exports.default = StatisticsModel;
