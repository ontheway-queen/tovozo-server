import AbstractRouter from "../../../abstract/abstract.router";
import JobSeekerReportController from "../controller/jobSeekerReport.controller";

export default class JobSeekerReportRouter extends AbstractRouter {
	private jobSeekerReportController = new JobSeekerReportController();
	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router
			.route("/")
			.post(this.jobSeekerReportController.submitReport)
			.get(this.jobSeekerReportController.getReportsWithInfo);

		this.router
			.route("/:id")
			.get(this.jobSeekerReportController.getSingleReportWithInfo);
	}
}
