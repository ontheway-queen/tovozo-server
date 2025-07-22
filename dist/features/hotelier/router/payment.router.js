"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const payment_controller_1 = __importDefault(require("../controller/payment.controller"));
class PaymentRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new payment_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        // get payments
        this.router
            .route("/get-initialize-payments")
            .get(this.controller.getPaymentsForHotelier);
        // get all payment ledger
        this.router
            .route("/payment-ledgers")
            .get(this.controller.getAllPaymentLedgerForHotelier);
        this.router
            .route("/:id")
            .get(this.controller.getSinglePaymentForHotelier);
        // create checkout session
        this.router
            .route("/create-checkout-session/:id")
            .post(this.controller.createCheckoutSession);
        this.router
            .route("/verify-checkout-session")
            .patch(this.controller.verifyCheckoutSession);
    }
}
exports.default = PaymentRouter;
