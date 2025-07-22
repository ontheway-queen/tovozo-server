import AbstractRouter from "../../../abstract/abstract.router";
import AdminPaymentController from "../controller/adminPayment.controller";

export default class AdminPaymentRouter extends AbstractRouter {
	private controller = new AdminPaymentController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router.route("/").get(this.controller.getAllPaymentsForAdmin);

		this.router
			.route("/payment-ledgers")
			.get(this.controller.getAllPaymentLedgersForAdmin);

		this.router.route("/:id").get(this.controller.getSinglePayment);
	}
}
