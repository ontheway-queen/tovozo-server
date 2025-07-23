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
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class JobModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createJob(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db(this.TABLES.jobs)
                .withSchema(this.DBO_SCHEMA)
                .insert(payload);
        });
    }
    getAllJobs(param_1) {
        return __awaiter(this, arguments, void 0, function* (param, need_total = true) {
            const { title, status, limit, skip, orderBy = "id", orderTo = "desc", } = param;
            const buildFilter = (qb) => {
                qb.where("is_deleted", false);
                if (title) {
                    qb.andWhere((builder) => {
                        builder
                            .where("title", "ilike", `%${title}%`)
                            .orWhere("details", "ilike", `%${title}%`);
                    });
                }
                if (status !== undefined) {
                    qb.andWhere("status", status);
                }
            };
            const data = yield this.db(this.TABLES.jobs)
                .withSchema(this.DBO_SCHEMA)
                .select("id", "title", "details", "hourly_rate", "job_seeker_pay", "platform_fee", "status", "is_deleted")
                .where(buildFilter)
                .orderBy(orderBy, orderTo)
                .limit(Number(limit || 100))
                .offset(Number(skip || 0));
            let total;
            if (need_total) {
                const totalQuery = yield this.db(this.TABLES.jobs)
                    .withSchema(this.DBO_SCHEMA)
                    .count("id as total")
                    .where(buildFilter)
                    .first();
                total = (totalQuery === null || totalQuery === void 0 ? void 0 : totalQuery.total) ? Number(totalQuery.total) : undefined;
            }
            return { data, total };
        });
    }
    getSingleJob(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db(this.TABLES.jobs)
                .withSchema(this.DBO_SCHEMA)
                .select("*")
                .where((qb) => {
                qb.where("is_deleted", false);
                qb.andWhere({ id });
            })
                .first();
        });
    }
    updateJob(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db(this.TABLES.jobs)
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    deleteJob(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db(this.TABLES.jobs)
                .withSchema(this.DBO_SCHEMA)
                .update("is_deleted", true)
                .where({ id });
        });
    }
}
exports.default = JobModel;
