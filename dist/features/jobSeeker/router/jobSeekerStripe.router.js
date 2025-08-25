"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const jobSeekerStripe_controller_1 = __importDefault(require("../controller/jobSeekerStripe.controller"));
class JobSeekerStripeRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.stripeController = new jobSeekerStripe_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        // Add Stripe Payout Account
        this.router
            .route("/add-stripe-payout-account")
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.JOB_SEEKER_FILES), this.stripeController.addStripePayoutAccount);
        // Onboard complete route
        this.router
            .route("/onboard/complete")
            .get(this.stripeController.onboardComplete);
        this.router
            .route("/auth/login")
            .get(this.stripeController.loginStripeAccount);
    }
}
exports.default = JobSeekerStripeRouter;
