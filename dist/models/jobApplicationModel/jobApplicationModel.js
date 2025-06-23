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
const customError_1 = __importDefault(require("../../utils/lib/customError"));
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class JobApplicationModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createJobApplication(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { job_post_details_id } = payload;
            const existingJobPostDetails = yield this.db("job_post_details")
                .withSchema(this.DBO_SCHEMA)
                .where({
                id: job_post_details_id,
            })
                .first();
            console.log("Existing Job Post Details:", existingJobPostDetails);
            if (existingJobPostDetails &&
                existingJobPostDetails.status !== "Pending") {
                throw new customError_1.default("You cannot apply to this job right now.", 422);
            }
            return yield this.db("job_applications")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, "id");
        });
    }
    markJobPostDetailAsApplied(job_post_detail_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("job_post_details")
                .withSchema(this.DBO_SCHEMA)
                .update({ status: "Applied" })
                .where({ id: job_post_detail_id });
        });
    }
}
exports.default = JobApplicationModel;
