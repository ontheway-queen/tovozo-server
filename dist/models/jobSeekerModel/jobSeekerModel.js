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
class JobSeekerModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createJobSeeker(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_seeker")
                .withSchema(this.JOB_SEEKER)
                .insert(payload, "user_id");
        });
    }
    updateJobSeeker(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_seeker")
                .withSchema(this.JOB_SEEKER)
                .update(payload)
                .where((qb) => {
                if (where.user_id) {
                    qb.andWhere("user_id", where.user_id);
                }
            });
        });
    }
    getJobSeeker(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_seeker")
                .withSchema(this.JOB_SEEKER)
                .select("*")
                .where((qb) => {
                if (where.user_id) {
                    qb.andWhere("user_id", where.user_id);
                }
            })
                .first();
        });
    }
    deleteJobSeeker(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_seeker")
                .withSchema(this.JOB_SEEKER)
                .where((qb) => {
                if (where.user_id) {
                    qb.andWhere("user_id", where.user_id);
                }
            })
                .del();
        });
    }
    setJobPreferences(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_preferences")
                .withSchema(this.JOB_SEEKER)
                .insert(payload);
        });
    }
    setJobLocations(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_locations")
                .withSchema(this.JOB_SEEKER)
                .insert(payload);
        });
    }
    setJobShifting(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_shifting")
                .withSchema(this.JOB_SEEKER)
                .insert(payload);
        });
    }
    getJobPreferences(job_seeker_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_preferences AS jp")
                .withSchema(this.JOB_SEEKER)
                .select("jp.*", "j.title")
                .joinRaw("LEFT JOIN dbo.jobs j ON jp.job_id = j.id")
                .where({ job_seeker_id });
        });
    }
    getJobLocations(job_seeker_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_locations")
                .withSchema(this.JOB_SEEKER)
                .select("*")
                .where({ job_seeker_id });
        });
    }
    getJobShifting(job_seeker_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_shifting")
                .withSchema(this.JOB_SEEKER)
                .select("*")
                .where({ job_seeker_id });
        });
    }
    createJobSeekerInfo(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_seeker_info")
                .withSchema(this.JOB_SEEKER)
                .insert(payload);
        });
    }
    updateJobSeekerInfo(payload, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_seeker_info")
                .withSchema(this.JOB_SEEKER)
                .update(payload)
                .where((qb) => {
                if (query.job_seeker_id) {
                    qb.andWhere({ job_seeker_id: query.job_seeker_id });
                }
            });
        });
    }
    getJobSeekerInfo(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_seeker_info")
                .withSchema(this.JOB_SEEKER)
                .select("*")
                .where((qb) => {
                if (query.job_seeker_id) {
                    qb.andWhere({ job_seeker_id: query.job_seeker_id });
                }
            })
                .first();
        });
    }
}
exports.default = JobSeekerModel;
