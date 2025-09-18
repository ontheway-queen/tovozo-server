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
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
class AdminJobPostService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getJobPostListForAdmin(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, status, name: search, from_date, to_date, } = req.query;
            const model = this.Model.jobPostModel();
            const data = yield model.getJobPostListForAdmin({
                limit: Number(limit) || 100,
                skip: Number(skip) || 0,
                status: status,
                search: search,
                from_date: from_date,
                to_date: to_date,
            });
            return Object.assign({ success: true, message: this.ResMsg.HTTP_OK, code: this.StatusCode.HTTP_OK }, data);
        });
    }
    getSingleJobPostForAdmin(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const model = this.Model.jobPostModel();
            const data = yield model.getSingleJobPostForAdmin(Number(id));
            if (!data) {
                throw new customError_1.default("Job post not found!", this.StatusCode.HTTP_NOT_FOUND);
            }
            return {
                success: true,
                message: this.ResMsg.HTTP_OK,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    cancelJobPostByAdmin(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const model = this.Model.jobPostModel(trx);
                const check = yield model.getSingleJobPostForAdmin(Number(id));
                if (!check) {
                    throw new customError_1.default("Job post not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                const notCancellableStatuses = [
                    "Work Finished",
                    "Complete",
                    "Cancelled",
                ];
                if (notCancellableStatuses.includes(check.job_post_details_status)) {
                    throw new customError_1.default(`Can't cancel. This job post is already ${check.job_post_details_status.toLowerCase()}.`, this.StatusCode.HTTP_BAD_REQUEST);
                }
                const data = yield model.updateJobPostDetailsStatus({
                    id: Number(id),
                    status: "Cancelled",
                });
                if (!data) {
                    throw new customError_1.default("Job post not found!", this.StatusCode.HTTP_NOT_FOUND);
                }
                return {
                    success: true,
                    message: this.ResMsg.HTTP_OK,
                    code: this.StatusCode.HTTP_OK,
                    data,
                };
            }));
        });
    }
}
exports.default = AdminJobPostService;
