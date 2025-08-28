import AbstractRouter from "../../../abstract/abstract.router";
import PayoutRequestsController from "../controller/payoutRequests.controller";

class AdminPayoutRequestRouter extends AbstractRouter {
	private controller = new PayoutRequestsController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router.route("/").get(this.controller.getAllPayoutRequests);
	}
}

export default AdminPayoutRequestRouter;
