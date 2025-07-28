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
class AdminStatsModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    generateStatistic(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from, to } = query;
            const dateFilter = (qb, table = "created_at") => {
                if (from)
                    qb.where(table, ">=", from);
                if (to)
                    qb.where(table, "<=", to);
            };
            const [totalJobSeekers] = yield this.db("job_seeker")
                .withSchema(this.JOB_SEEKER)
                .modify((qb) => dateFilter(qb))
                .count("user_id as total");
            const [totalHoteliers] = yield this.db("organization")
                .withSchema(this.HOTELIER)
                .modify((qb) => dateFilter(qb))
                .count("user_id as total");
            const today = new Date().toISOString().split("T")[0];
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
                .modify((qb) => dateFilter(qb))
                .count("id as total");
            const [activeJobPosts] = yield this.db("job_post")
                .withSchema(this.DBO_SCHEMA)
                .where("status", "Live")
                .modify((qb) => dateFilter(qb))
                .count("id as total");
            const [cancelledJobPosts] = yield this.db("job_post")
                .withSchema(this.DBO_SCHEMA)
                .where("status", "Cancelled")
                .modify((qb) => dateFilter(qb))
                .count("id as total");
            const [successfulHires] = yield this.db("payment")
                .withSchema(this.DBO_SCHEMA)
                .where("status", "Paid")
                .modify((qb) => dateFilter(qb))
                .countDistinct("application_id as total");
            const [totalPayments] = yield this.db("payment")
                .withSchema(this.DBO_SCHEMA)
                .modify((qb) => dateFilter(qb))
                .sum("total_amount as total");
            const [pendingPayments] = yield this.db("payment")
                .withSchema(this.DBO_SCHEMA)
                .where("status", "Unpaid")
                .modify((qb) => dateFilter(qb))
                .sum("total_amount as total");
            const [paidPayments] = yield this.db("payment")
                .withSchema(this.DBO_SCHEMA)
                .where("status", "Paid")
                .modify((qb) => dateFilter(qb))
                .sum("total_amount as total");
            const [totalReports] = yield this.db("reports")
                .withSchema(this.DBO_SCHEMA)
                .modify((qb) => dateFilter(qb))
                .count("id as total");
            return {
                jobSeekers: {
                    total: Number(totalJobSeekers.total),
                    new: Number(newJobSeekers.total),
                },
                hoteliers: {
                    total: Number(totalHoteliers.total),
                    new: Number(newHoteliers.total),
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
                reports: Number(totalReports.total),
            };
        });
    }
}
exports.default = AdminStatsModel;
