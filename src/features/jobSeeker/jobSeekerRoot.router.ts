import { Router } from "express";
import AbstractRouter from "../../abstract/abstract.router";
import jobSeekerProfileRouter from "./router/jobSeekerProfile.router";
import { JobSeekerJobsRouter } from "./router/jobSeekerJobs.router";
import { JobSeekerJobApplicationRouter } from "./router/jobSeekerJobApplication.router";
import JobTaskActivityRouter from "./router/jobSeekerJobTaskActivity.router";
import JobSeekerReportRouter from "./router/jobSeekerReport.router";
import { JobSeekerCancellationApplicationLogsRouter } from "./router/jobSeekerCancellationLog.router";

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
	}
}
