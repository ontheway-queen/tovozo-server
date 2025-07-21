import AbstractRouter from "../../abstract/abstract.router";
import { JobSeekerCancellationApplicationLogsRouter } from "./router/jobSeekerCancellationLog.router";
import { JobSeekerJobApplicationRouter } from "./router/jobSeekerJobApplication.router";
import { JobSeekerJobsRouter } from "./router/jobSeekerJobs.router";
import JobTaskActivityRouter from "./router/jobSeekerJobTaskActivity.router";
import JobSeekerPaymentRouter from "./router/jobSeekerPayment.router";
import jobSeekerProfileRouter from "./router/jobSeekerProfile.router";
import JobSeekerReportRouter from "./router/jobSeekerReport.router";
import JobSeekerStripeRouter from "./router/jobSeekerStripe.router";

export default class JobSeekerRootRouter extends AbstractRouter {
	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		// profile router
		this.router.use("/profile", new jobSeekerProfileRouter().router);

		// job seeker jobs router
		this.router.use("/jobs", new JobSeekerJobsRouter().router);

		// job seeker job application router
		this.router.use(
			"/job-application",
			new JobSeekerJobApplicationRouter().router
		);

		this.router.use(
			"/cancellation-logs",
			new JobSeekerCancellationApplicationLogsRouter().router
		);

		this.router.use(
			"/job-task-activity",
			new JobTaskActivityRouter().router
		);

		// reports
		this.router.use("/reports", new JobSeekerReportRouter().router);

		// Stripe
		this.router.use("/stripe", new JobSeekerStripeRouter().router);

		// payments
		this.router.use("/payments", new JobSeekerPaymentRouter().router);
	}
}
