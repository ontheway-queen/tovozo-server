import AbstractRouter from "../../../abstract/abstract.router";
import { JobSeekerJobsController } from "../controller/jobSeekerJobs.controller";

export class JobSeekerJobsRouter extends AbstractRouter {
	private controller = new JobSeekerJobsController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router.route("/").get(this.controller.getJobPostListForJobSeeker);

		this.router.route("/save-job").get(this.controller.getSavedJobsList);

		this.router
			.route("/save-job/:id")
			.post(this.controller.saveJobPostDetailsForJobSeeker)
			.delete(this.controller.deleteSavedJob);

		this.router
			.route("/:id")
			.get(this.controller.getSingleJobPostForJobSeeker);
	}
}
