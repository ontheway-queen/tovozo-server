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
class PaymentService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getPaymentsForHotelier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, search } = req.query;
            const { user_id } = req.hotelier;
            const params = {
                hotelier_id: user_id,
                limit: Number(limit) || 100,
                skip: Number(skip) || 0,
                search: search ? String(search) : "",
            };
            const paymentModel = this.Model.paymnentModel();
            const { data, total } = yield paymentModel.getPaymentsForHotelier(params);
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
exports.default = PaymentService;
