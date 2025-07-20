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
			.route("/get-payments")
			.get(this.controller.getPaymentsForHotelier);
	}
}
