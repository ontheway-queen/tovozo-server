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
                .insert(payload);
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
    // get single job seeker details
    getJobSeekerDetails(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("vw_full_job_seeker_profile")
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
    updateJobLocations(payload, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_locations")
                .withSchema(this.JOB_SEEKER)
                .update(payload)
                .where((qb) => {
                if (query.job_seeker_id) {
                    qb.andWhere("job_seeker_id", query.job_seeker_id);
                }
                if (query.location_id) {
                    qb.andWhere("location_id", query.location_id);
                }
            });
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
    getSingleJobPreference(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_preferences AS jp")
                .withSchema(this.JOB_SEEKER)
                .select("jp.*", "j.title")
                .joinRaw("LEFT JOIN dbo.jobs j ON jp.job_id = j.id")
                .where((qb) => {
                if (query.job_seeker_id) {
                    qb.andWhere({ job_seeker_id: query.job_seeker_id });
                }
                if (query.job_id) {
                    qb.andWhere({ job_id: query.job_id });
                }
            })
                .first();
        });
    }
    deleteJobPreferences(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_preferences AS jp")
                .withSchema(this.JOB_SEEKER)
                .del()
                .where((qb) => {
                if (query.job_seeker_id) {
                    qb.andWhere({ job_seeker_id: query.job_seeker_id });
                }
                if (query.job_ids) {
                    qb.whereIn("job_id", query.job_ids);
                }
            });
        });
    }
    getJobLocations(job_seeker_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_locations AS jl")
                .withSchema(this.JOB_SEEKER)
                .select("jl.*", "l.name as location_name", "l.address as location_address")
                .joinRaw("LEFT JOIN dbo.location l ON jl.location_id = l.id")
                .where({ job_seeker_id });
        });
    }
    deleteJobLocations(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_locations")
                .withSchema(this.JOB_SEEKER)
                .del()
                .where((qb) => {
                qb.andWhere({ is_home_address: false });
                if (query.job_seeker_id) {
                    qb.andWhere({ job_seeker_id: query.job_seeker_id });
                }
                if (query.location_ids) {
                    qb.whereIn("location_id", query.location_ids);
                }
            });
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
    getSingleJobShift(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_shifting")
                .withSchema(this.JOB_SEEKER)
                .select("*")
                .where((qb) => {
                if (query.job_seeker_id) {
                    qb.andWhere({ job_seeker_id: query.job_seeker_id });
                }
                if (query.shift) {
                    qb.andWhere({ shift: query.shift });
                }
            })
                .first();
        });
    }
    deleteJobShifting(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_shifting")
                .withSchema(this.JOB_SEEKER)
                .del()
                .where((qb) => {
                if (query.job_seeker_id) {
                    qb.andWhere({ job_seeker_id: query.job_seeker_id });
                }
                if (query.name) {
                    qb.whereIn("shift", query.name);
                }
            });
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
