import bodyParser from "body-parser";
import Stripe from "stripe";
import config from "../../app/config";
import express, { Request, Response } from "express";
import { db } from "../../app/database";

export const stripe = new Stripe(config.STRIPE_SECRET_KEY!);

export class StripeWebhook {
	public Router = express.Router();
	private stripe: Stripe;

	constructor() {
		this.stripe = stripe;
		this.initRoutes();
	}

	private initRoutes() {
		this.Router.post(
			"/stripe/account",
			bodyParser.raw({ type: "application/json" }),
			(req: Request, res: Response) => this.handleAccountWebhook(req, res)
		);
		this.Router.post(
			"/stripe/connect-account",
			bodyParser.raw({ type: "application/json" }),
			(req: Request, res: Response) =>
				this.handleConnectAccountWebhook(req, res)
		);
	}

	private async handleAccountWebhook(
		req: Request,
		res: Response
	): Promise<any> {
		const sig = req.headers["stripe-signature"] as string;
		let event: Stripe.Event;

		try {
			event = this.stripe.webhooks.constructEvent(
				req.body,
				sig,
				config.ACCOUNT_WEBHOOK_SECRET
			);
		} catch (err: any) {
			console.error(
				"❌ Webhook signature verification failed:",
				err.message
			);
			return res.status(400).send(`Webhook Error: ${err.message}`);
		}

		console.log(`📩 Received event: ${event.type}`);

		switch (event.type) {
			case "payout.created":
				await this.onPayoutCreated(event.data.object as Stripe.Payout);
				break;
			case "payout.paid":
				await this.onPayoutPaid(event.data.object as Stripe.Payout);
				break;
			case "payout.failed":
				await this.onPayoutFailed(event.data.object as Stripe.Payout);
				break;
			case "payout.canceled":
				await this.onPayoutCanceled(event.data.object as Stripe.Payout);
				break;
			default:
				console.log(`⚠️ Ignored event type: ${event.type}`);
		}

		res.json({ received: true });
	}

	private async handleConnectAccountWebhook(
		req: Request,
		res: Response
	): Promise<any> {
		const sig = req.headers["stripe-signature"] as string;
		let event: Stripe.Event;

		try {
			event = this.stripe.webhooks.constructEvent(
				req.body,
				sig,
				config.CONNECT_ACCOUNT_WEBHOOK_SECRET
			);
		} catch (err: any) {
			console.error(
				"❌ Webhook signature verification failed:",
				err.message
			);
			return res.status(400).send(`Webhook Error: ${err.message}`);
		}

		console.log(`📩 Received event: ${event.type}`);

		switch (event.type) {
			case "payout.created":
				await this.onPayoutCreated(event.data.object as Stripe.Payout);
				break;
			case "payout.paid":
				await this.onPayoutPaid(event.data.object as Stripe.Payout);
				break;
			case "payout.failed":
				await this.onPayoutFailed(event.data.object as Stripe.Payout);
				break;
			case "payout.canceled":
				await this.onPayoutCanceled(event.data.object as Stripe.Payout);
				break;
			default:
				console.log(`⚠️ Ignored event type: ${event.type}`);
		}

		res.json({ received: true });
	}

	// ---- Payout Handlers ----
	private async onPayoutCreated(payout: Stripe.Payout) {
		console.log("💰 Payout created:", payout.id);
		// await this.logPayoutEvent("payout.created", payout);
		console.log({ payout });
	}

	private async onPayoutPaid(payout: Stripe.Payout) {
		console.log("✅ Payout paid:", payout.id);
		// await this.logPayoutEvent("payout.paid", payout);
		console.log({ payout });
	}

	private async onPayoutFailed(payout: Stripe.Payout) {
		console.log("❌ Payout failed:", payout.id);
		// await this.logPayoutEvent("payout.failed", payout);
		console.log({ payout });
	}

	private async onPayoutCanceled(payout: Stripe.Payout) {
		console.log("⚠️ Payout canceled:", payout.id);
		console.log({ payout });
		// await this.logPayoutEvent("payout.canceled", payout);
	}

	// private async logPayoutEvent(eventType: string, payout: Stripe.Payout) {
	// 	await db("payout_logs").insert({
	// 		event_type: eventType,
	// 		payout_id: payout.id,
	// 		amount: payout.amount / 100,
	// 		status: payout.status,
	// 		arrival_date: new Date(payout.arrival_date * 1000),
	// 		created_at: new Date(),
	// 	});
	// }
}
