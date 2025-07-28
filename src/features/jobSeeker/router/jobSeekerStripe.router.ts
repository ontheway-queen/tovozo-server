import AbstractRouter from "../../../abstract/abstract.router";
import JobSeekerStripeController from "../controller/jobSeekerStripe.controller";

export default class JobSeekerStripeRouter extends AbstractRouter {
	private stripeController = new JobSeekerStripeController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		// Add Stripe Payout Account
		this.router
			.route("/add-stripe-payout-account")
			.patch(this.stripeController.addStripePayoutAccount);

		// Onboard complete route
		this.router
			.route("/onboard/complete")
			.get(this.stripeController.onboardComplete);

		this.router
			.route("/auth/login")
			.get(this.stripeController.loginStripeAccount);
	}
}
