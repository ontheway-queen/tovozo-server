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
exports.JobSeekerCancellationLogServices = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const constants_1 = require("../../../utils/miscellaneous/constants");
class JobSeekerCancellationLogServices extends abstract_service_1.default {
    constructor() {
        super();
        this.getCancellationApplicationLogs = (req) => __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.jobSeeker;
            const { limit, skip, status } = req.query;
            const model = this.Model.cancellationLogModel();
            const data = yield model.getJobApplicationCancellationLogs({
                user_id,
                limit,
                skip,
                status,
            });
            return Object.assign({ success: true, message: this.ResMsg.HTTP_OK, code: this.StatusCode.HTTP_OK }, data);
        });
        this.getCancellationApplicationLog = (req) => __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.jobSeeker;
            const { id } = req.params;
            const model = this.Model.cancellationLogModel();
            const data = yield model.getSingleJobApplicationCancellationLog(Number(id), constants_1.CANCELLATION_REPORT_TYPE.CANCEL_APPLICATION, null, user_id);
            if (!data) {
                return {
                    success: false,
                    message: `Cancellation report with ID ${id} not found`,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                message: this.ResMsg.HTTP_OK,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
}
exports.JobSeekerCancellationLogServices = JobSeekerCancellationLogServices;
