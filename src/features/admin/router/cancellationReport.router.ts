import AbstractRouter from "../../../abstract/abstract.router";
import AdminCancellationReportController from "../controller/cancellationReport.controller";

class CancellationReportRouter extends AbstractRouter {
	private controller = new AdminCancellationReportController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router.route("/").get(this.controller.getReports);

		this.router
			.route("/:id")
			.get(this.controller.getSingleReport)
			.patch(this.controller.updateCancellationReportStatus);
	}
}

export default CancellationReportRouter;
