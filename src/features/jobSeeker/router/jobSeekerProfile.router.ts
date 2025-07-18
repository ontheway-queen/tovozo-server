import AbstractRouter from "../../../abstract/abstract.router";
import JobSeekerProfileController from "../controller/jobSeekerProfile.controller";

export default class jobSeekerProfileRouter extends AbstractRouter {
  private controller = new JobSeekerProfileController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // get profile
    this.router
      .route("/")
      .get(this.controller.getProfile)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.JOB_SEEKER_FILES),
        this.controller.updateProfile
      );

    // change password
    this.router.route("/change-password").post(this.controller.changePassword);
  }
}
