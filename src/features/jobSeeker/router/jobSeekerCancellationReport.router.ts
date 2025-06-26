import AbstractRouter from "../../../abstract/abstract.router";
import { JobSeekerCancellationApplicationReportController } from "../controller/jobSeekerCancellationReport.controller";

export class JobSeekerCancellationApplicationReportsRouter extends AbstractRouter {
	private controller = new JobSeekerCancellationApplicationReportController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router
			.route("/")
			.get(this.controller.getgetCancellationApplicationReports);

		this.router
			.route("/:id")
			.get(this.controller.getCancellationApplicationReport);
	}
}
