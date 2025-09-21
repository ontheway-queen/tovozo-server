"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankDetailsRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const bankDetails_controller_1 = require("../controller/bankDetails.controller");
class BankDetailsRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new bankDetails_controller_1.BankDetailsController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .get(this.controller.getBankAccounts)
            .post(this.controller.addBankAccounts);
        this.router.route("/:id").delete(this.controller.removeBankAccount);
    }
}
exports.BankDetailsRouter = BankDetailsRouter;
