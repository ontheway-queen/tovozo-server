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
class JobSeekerServices extends abstract_service_1.default {
    constructor() {
        super();
        this.getJobs = (req) => __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, status } = req.query;
            const { user_id } = req.jobSeeker;
            console.log({ user_id, limit, skip });
            const model = this.Model.jobPostModel();
            const { data, total } = yield model.getJobPostList(Object.assign(Object.assign({}, req), { status: "Pending" }));
            return {
                success: true,
                message: this.ResMsg.HTTP_SUCCESSFUL,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                data,
                total: total || 0,
            };
        });
    }
}
exports.JobSeekerServices = JobSeekerServices;
