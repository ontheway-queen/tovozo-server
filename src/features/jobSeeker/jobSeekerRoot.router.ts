import AbstractRouter from "../../abstract/abstract.router";
import { JobSeekerCancellationApplicationLogsRouter } from "./router/jobSeekerCancellationLog.router";
import { JobSeekerChatRouter } from "./router/jobSeekerChat.router";
import { JobSeekerJobApplicationRouter } from "./router/jobSeekerJobApplication.router";
import { JobSeekerJobsRouter } from "./router/jobSeekerJobs.router";
import JobTaskActivityRouter from "./router/jobSeekerJobTaskActivity.router";
import jobSeekerNotificationRouter from "./router/jobSeekerNotification.router";
import JobSeekerPaymentRouter from "./router/jobSeekerPayment.router";
import JobSeekerPayoutRoute from "./router/jobSeekerPayout.router";
import jobSeekerProfileRouter from "./router/jobSeekerProfile.router";
import JobSeekerReportRouter from "./router/jobSeekerReport.router";

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

		// payments
		this.router.use("/payments", new JobSeekerPaymentRouter().router);

		this.router.use(
			"/notification",
			new jobSeekerNotificationRouter().router
		);

		this.router.use("/chat", new JobSeekerChatRouter().router);

		this.router.use("/payouts", new JobSeekerPayoutRoute().router);
	}
}
