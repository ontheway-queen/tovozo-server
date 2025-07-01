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
const constants_1 = require("../../../utils/miscellaneous/constants");
class HotelierReportService extends abstract_service_1.default {
    constructor() {
        super();
        this.submitReport = (req) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const body = req.body;
            const model = this.Model.reportModel();
            const isReportExist = yield model.getSingleReport(body.job_post_details_id);
            if (isReportExist) {
                throw new customError_1.default(`A report is already submitted for the job post.`, this.StatusCode.HTTP_CONFLICT);
            }
            const res = yield model.submitReport(Object.assign({}, body));
            if (!res.length) {
                throw new customError_1.default(`Failed to submit the report. Please try again later.`, this.StatusCode.HTTP_BAD_REQUEST);
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: (_a = res[0]) === null || _a === void 0 ? void 0 : _a.id,
            };
        });
        this.getReportsWithInfo = (req) => __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, searchQuery } = req.query;
            const { user_id } = req.hotelier;
            const model = this.Model.reportModel();
            const res = yield model.getReportsWithInfo({
                user_id,
                type: constants_1.REPORT_TYPE.TaskActivity,
                limit: Number(limit),
                skip: Number(skip),
                searchQuery: searchQuery,
            });
            console.log(req.hotelier);
            return Object.assign({ success: true, code: this.StatusCode.HTTP_OK, message: this.ResMsg.HTTP_OK }, res);
        });
        this.getSingleReportWithInfo = (req) => __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const model = this.Model.reportModel();
            const res = yield model.getSingleReportWithInfo(Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: res,
            };
        });
    }
}
exports.default = HotelierReportService;
