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
exports.StripeWebhook = exports.stripe = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const stripe_1 = __importDefault(require("stripe"));
const config_1 = __importDefault(require("../../app/config"));
const express_1 = __importDefault(require("express"));
exports.stripe = new stripe_1.default(config_1.default.STRIPE_SECRET_KEY);
class StripeWebhook {
    constructor(stripeInstance, webhookSecret) {
        this.Router = express_1.default.Router();
        this.stripe = stripeInstance;
        this.webhookSecret = webhookSecret;
        this.initRoutes();
    }
    initRoutes() {
        this.Router.post("/stripe", body_parser_1.default.raw({ type: "application/json" }), (req, res) => this.handleWebhook(req, res));
    }
    handleWebhook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const sig = req.headers["stripe-signature"];
            let event;
            try {
                event = this.stripe.webhooks.constructEvent(req.body, sig, this.webhookSecret);
            }
            catch (err) {
                console.error("❌ Webhook signature verification failed:", err.message);
                return res.status(400).send(`Webhook Error: ${err.message}`);
            }
            console.log(`📩 Received event: ${event.type}`);
            switch (event.type) {
                case "payout.created":
                    yield this.onPayoutCreated(event.data.object);
                    break;
                case "payout.paid":
                    yield this.onPayoutPaid(event.data.object);
                    break;
                case "payout.failed":
                    yield this.onPayoutFailed(event.data.object);
                    break;
                case "payout.canceled":
                    yield this.onPayoutCanceled(event.data.object);
                    break;
                default:
                    console.log(`⚠️ Ignored event type: ${event.type}`);
            }
            res.json({ received: true });
        });
    }
    // ---- Payout Handlers ----
    onPayoutCreated(payout) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("💰 Payout created:", payout.id);
            // await this.logPayoutEvent("payout.created", payout);
            console.log({ payout });
        });
    }
    onPayoutPaid(payout) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("✅ Payout paid:", payout.id);
            // await this.logPayoutEvent("payout.paid", payout);
            console.log({ payout });
        });
    }
    onPayoutFailed(payout) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("❌ Payout failed:", payout.id);
            // await this.logPayoutEvent("payout.failed", payout);
            console.log({ payout });
        });
    }
    onPayoutCanceled(payout) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("⚠️ Payout canceled:", payout.id);
            console.log({ payout });
            // await this.logPayoutEvent("payout.canceled", payout);
        });
    }
}
exports.StripeWebhook = StripeWebhook;
