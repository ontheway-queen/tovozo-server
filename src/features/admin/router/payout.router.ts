import AbstractRouter from "../../../abstract/abstract.router";
import AdminPayoutController from "../controller/payout.controller";

class AdminPayoutRouter extends AbstractRouter {
	private controller = new AdminPayoutController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router.route("/").get(this.controller.getAllPayouts);

		this.router
			.route("/:id")
			.get(this.controller.getSinglePayout)
			.patch(this.controller.managePayout);
	}
}

export default AdminPayoutRouter;
