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
exports.JobSeekerServices = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const constants_1 = require("../../../utils/miscellaneous/constants");
class JobSeekerServices extends abstract_service_1.default {
    constructor() {
        super();
        this.getJobPostListForJobSeeker = (req) => __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.jobSeeker;
            const { category_id, limit, skip, city_id, from_date, to_date, name } = req.query;
            const model = this.Model.jobPostModel();
            const { data, total } = yield model.getJobPostListForJobSeeker({
                user_id,
                category_id,
                limit,
                skip,
                status: constants_1.JOB_POST_DETAILS_STATUS.Pending,
                city_id,
                from_date,
                to_date,
                search: name,
            });
            return {
                success: true,
                message: this.ResMsg.HTTP_OK,
                code: this.StatusCode.HTTP_OK,
                data,
                total: total || 0,
            };
        });
        this.getSingleJobPostForJobSeeker = (req) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const model = this.Model.jobPostModel();
            const data = yield model.getSingleJobPostForJobSeeker(Number(id));
            return {
                success: true,
                message: this.ResMsg.HTTP_OK,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
}
exports.JobSeekerServices = JobSeekerServices;
