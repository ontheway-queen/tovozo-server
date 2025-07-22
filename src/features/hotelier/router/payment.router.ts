import AbstractRouter from "../../../abstract/abstract.router";
import PaymentController from "../controller/payment.controller";

export default class PaymentRouter extends AbstractRouter {
	private controller = new PaymentController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
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
