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
const constants_1 = require("../../../utils/miscellaneous/constants");
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
class HotelierCancellationReportService extends abstract_service_1.default {
    constructor() {
        super();
        // get cancellation reports
        this.getCancellationReports = (req) => __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.hotelier;
            const { status, limit, skip, searchQuery, report_type } = req.query;
            const model = this.Model.cancellationReportModel();
            const data = yield model.getJobPostReports({
                user_id,
                status,
                report_type: report_type || constants_1.CANCELLATION_REPORT_TYPE.CANCEL_JOB_POST,
                limit,
                skip,
                searchQuery,
            });
            return Object.assign({ success: true, code: this.StatusCode.HTTP_OK, message: this.ResMsg.HTTP_OK }, data);
        });
        this.getCancellationReport = (req) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const model = this.Model.cancellationReportModel();
            const data = yield model.getSingleJobPostReport(Number(id), constants_1.CANCELLATION_REPORT_TYPE.CANCEL_JOB_POST);
            if (!data) {
                throw new customError_1.default("Job post cancellation report not found", this.StatusCode.HTTP_NOT_FOUND);
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
            };
        });
        this.cancelJobPostReport = (req) => __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const model = this.Model.cancellationReportModel(trx);
                const jobPostReport = yield model.getSingleJobPostReport(Number(id), constants_1.CANCELLATION_REPORT_TYPE.CANCEL_JOB_POST);
                if (!jobPostReport) {
                    throw new customError_1.default("Job post cancellation report not found", this.StatusCode.HTTP_NOT_FOUND);
                }
                if (jobPostReport.status !== constants_1.CANCELLATION_REPORT_STATUS.PENDING) {
                    throw new customError_1.default(`Only reports with status 'PENDING' can be cancelled. Current status is '${jobPostReport.status}'.`, this.StatusCode.HTTP_BAD_REQUEST);
                }
                yield model.updateCancellationReportStatus(Number(id), {
                    status: constants_1.CANCELLATION_REPORT_STATUS.CANCELLED,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
}
exports.default = HotelierCancellationReportService;
