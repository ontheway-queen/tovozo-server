import AbstractRouter from "../../../abstract/abstract.router";
import AdminJobSeekerController from "../controller/jobSeeker.controller";

class AdminJobSeekerRouter extends AbstractRouter {
	private controller = new AdminJobSeekerController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router
			.route("/")
			.get(this.controller.getJobSeekers)
			.post(
				this.uploader.cloudUploadRaw(this.fileFolders.JOB_SEEKER_FILES),
				this.controller.createJobSeeker
			);

		this.router
			.route("/:id")
			.get(this.controller.getSingleJobSeeker)
			.patch(
				this.uploader.cloudUploadRaw(this.fileFolders.JOB_SEEKER_FILES),
				this.controller.updateJobSeeker
			)
			.delete(this.controller.deleteJobSeeker);
	}
}

export default AdminJobSeekerRouter;
