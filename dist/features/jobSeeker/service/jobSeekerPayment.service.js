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
class JobSeekerPaymentService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getJobSeekerPayments(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.jobSeeker;
            const { search, limit, skip, status } = req.query;
            const paymentModel = this.Model.paymnentModel();
            const { data, total } = yield paymentModel.getPaymentsForJobSeeker({
                job_seeker_id: user_id,
                search: search,
                limit: Number(limit),
                skip: Number(skip),
                status: status,
            });
            return {
                success: true,
                message: this.ResMsg.HTTP_OK,
                code: this.StatusCode.HTTP_OK,
                data,
                total,
            };
        });
    }
    getSinglePayment(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const paymentModel = this.Model.paymnentModel();
            const payment = yield paymentModel.getSinglePayment(Number(id));
            if (!payment) {
                return {
                    success: false,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                message: this.ResMsg.HTTP_OK,
                code: this.StatusCode.HTTP_OK,
                data: payment,
            };
        });
    }
    getAllPaymentLedgersForJobSeeker(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.jobSeeker;
            const { search, limit, skip } = req.query;
            const paymentModel = this.Model.paymnentModel();
            const { data, total } = yield paymentModel.getAllPaymentLedgerForJobSeeker({
                job_seeker_id: user_id,
                search: search,
                limit: Number(limit),
                skip: Number(skip),
            });
            return {
                success: true,
                message: this.ResMsg.HTTP_OK,
                code: this.StatusCode.HTTP_OK,
                data,
                total,
            };
        });
    }
}
exports.default = JobSeekerPaymentService;
