import AbstractRouter from "../../../abstract/abstract.router";
import StripeController from "../controller/stripe.controller";

export default class StripeRouter extends AbstractRouter {
	private stripeController = new StripeController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		// Onboard complete route
		this.router
			.route("/onboard/complete")
			.get(this.stripeController.onboardComplete);
	}
}
