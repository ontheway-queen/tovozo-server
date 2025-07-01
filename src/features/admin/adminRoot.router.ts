import { Router } from "express";
import AdminAdministrationRouter from "./router/administration.router";
import AdminJobRouter from "./router/jobs.router";
import AdminJobSeekerRouter from "./router/jobSeeker.router";
import AdminProfileRouter from "./router/profile.router";
import CancellationReportRouter from "./router/cancellationReport.router";
import AdminHotelierController from "./controller/hotelier.controller";
import AdminHotelierRouter from "./router/hotelier.router";
import AdminJobPostRouter from "./router/jobPost.router";
import AdminReportRouter from "./router/report.router";

export default class AdminRootRouter {
	public Router = Router();
	private AdminAdministrationRouter = new AdminAdministrationRouter();
	private adminProfileRouter = new AdminProfileRouter();
	private adminJobRouter = new AdminJobRouter();
	private adminJobSeekerRouter = new AdminJobSeekerRouter();
	private adminHotelierRouter = new AdminHotelierRouter();
	private cancellationReportRouter = new CancellationReportRouter();
	private jobPostRouter = new AdminJobPostRouter();
	private reportRouter = new AdminReportRouter();

	constructor() {
		this.callRouter();
	}

	private callRouter() {
		//administration
		this.Router.use(
			"/administration",
			this.AdminAdministrationRouter.router
		);
		// profile router
		this.Router.use("/profile", this.adminProfileRouter.router);
		// job router
		this.Router.use("/job-category", this.adminJobRouter.router);
		// Job seeker
		this.Router.use("/job-seeker", this.adminJobSeekerRouter.router);

		// hotelier
		this.Router.use("/hotelier", this.adminHotelierRouter.router);

		// jobs
		this.Router.use("/jobs", this.jobPostRouter.router);

		// cancellation report
		this.Router.use(
			"/cancellation-report",
			this.cancellationReportRouter.router
		);

		// report
		this.Router.use("/reports", this.reportRouter.router);
	}
}
