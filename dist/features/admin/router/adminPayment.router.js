"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const adminPayment_controller_1 = __importDefault(require("../controller/adminPayment.controller"));
class AdminPaymentRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminPayment_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/").get(this.controller.getAllPaymentsForAdmin);
        this.router
            .route("/payment-ledgers")
            .get(this.controller.getAllPaymentLedgersForAdmin);
        this.router.route("/:id").get(this.controller.getSinglePayment);
    }
}
exports.default = AdminPaymentRouter;
