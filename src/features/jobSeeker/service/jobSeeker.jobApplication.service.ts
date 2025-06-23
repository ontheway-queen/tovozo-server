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
exports.JobSeekerJobApplication = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
class JobSeekerJobApplication extends abstract_service_1.default {
    constructor() {
        super();
        this.createJobApplication = (req) => __awaiter(this, void 0, void 0, function* () {
            const { job_post_details_id } = req.query;
            const { user_id } = req.jobSeeker;
            const payload = {
                job_post_details_id: Number(job_post_details_id),
                job_seeker_id: user_id,
            };
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const model = this.Model.jobApplicationModel(trx);
                const res = yield model.createJobApplication(payload);
                yield model.markJobPostDetailAsApplied(Number(job_post_details_id));
                return {
                    success: true,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    data: (_a = res[0]) === null || _a === void 0 ? void 0 : _a.id,
                };
            }));
        });
    }
}
exports.JobSeekerJobApplication = JobSeekerJobApplication;
