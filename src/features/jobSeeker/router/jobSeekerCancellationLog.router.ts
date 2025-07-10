import AbstractRouter from "../../../abstract/abstract.router";
import { JobSeekerCancellationApplicationLogController } from "../controller/jobSeekerCancellationLog.controller";

export class JobSeekerCancellationApplicationLogsRouter extends AbstractRouter {
	private controller = new JobSeekerCancellationApplicationLogController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router
			.route("/")
			.get(this.controller.getCancellationApplicationLogs);

		this.router
			.route("/:id")
			.get(this.controller.getCancellationApplicationLog);
	}
}
