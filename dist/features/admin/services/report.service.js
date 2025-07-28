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
class AdminReportService extends abstract_service_1.default {
    constructor() {
        super();
        this.getReportsWithInfo = (req) => __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, searchQuery, type, report_status } = req.query;
            const model = this.Model.reportModel();
            const res = yield model.getReportsWithInfo({
                limit: Number(limit),
                skip: Number(skip),
                searchQuery: searchQuery,
                type: type,
                report_status: report_status,
            });
            return Object.assign({ success: true, code: this.StatusCode.HTTP_OK, message: this.ResMsg.HTTP_OK }, res);
        });
        this.reportMarkAsAcknowledge = (req) => __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id } = req.admin;
                const id = req.params.id;
                const body = req.body;
                const model = this.Model.reportModel(trx);
                const isReportExist = yield model.getSingleReport(null, Number(id));
                if (!isReportExist) {
                    throw new customError_1.default(`Report with ID ${id} not found`, this.StatusCode.HTTP_NOT_FOUND);
                }
                if (isReportExist.status !== constants_1.REPORT_STATUS.Pending) {
                    throw new customError_1.default(`Cannot perform this action because the report is already ${isReportExist.status.toLowerCase()}.`, this.StatusCode.HTTP_BAD_REQUEST);
                }
                body.status = constants_1.REPORT_STATUS.Acknowledge;
                body.resolved_by = user_id;
                body.resolved_at = new Date();
                yield model.reportMarkAsAcknowledge(Number(id), body);
                yield this.insertAdminAudit(trx, {
                    details: `Report ID - ${id} has been updated.`,
                    created_by: user_id,
                    endpoint: req.originalUrl,
                    type: "UPDATE",
                    payload: JSON.stringify(body),
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
exports.default = AdminReportService;
