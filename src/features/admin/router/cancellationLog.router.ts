import AbstractRouter from "../../../abstract/abstract.router";
import AdminCancellationReportController from "../controller/cancellationLog.controller";

class CancellationReportRouter extends AbstractRouter {
	private controller = new AdminCancellationReportController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router.route("/").get(this.controller.getCancellationLogs);

		this.router
			.route("/:id")
			.get(this.controller.getSingleCancellationLog)
			.patch(this.controller.updateCancellationLogStatus);
	}
}

export default CancellationReportRouter;
