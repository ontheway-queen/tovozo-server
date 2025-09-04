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
class AdminPaymentService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getAllPaymentsForAdmin(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, limit, skip, status } = req.query;
            const paymentModel = this.Model.paymnentModel();
            const { data, total } = yield paymentModel.getAllPaymentsForAdmin({
                search: name,
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
            const payment = yield paymentModel.getSinglePaymentForAdmin(Number(id));
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
    getAllPaymentLedgersForAdmin(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, from_date, to_date, user_id, limit, skip, type } = req.query;
            const paymentModel = this.Model.paymnentModel();
            const { data, total } = yield paymentModel.getAllPaymentLedgerForAdmin({
                search: name,
                limit: Number(limit),
                skip: Number(skip),
                type: type,
                from_date: from_date,
                to_date: to_date,
                user_id: user_id,
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
exports.default = AdminPaymentService;
