import AbstractRouter from "../../../abstract/abstract.router";
import JobSeekerAuthController from "../controller/auth.jobSeeker.controller";

class JobSeekerAuthRouter extends AbstractRouter {
  private controller = new JobSeekerAuthController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    //register
    this.router
      .route("/registration")
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.JOB_SEEKER_FILES),
        this.authChecker.jobSeekerAuthChecker,
        this.controller.registration
      );

    //login
    this.router.route("/login").post(this.controller.login);

    this.router.route("/login-data").post(this.controller.LoginData);

    //forget password
    this.router.route("/forget-password").post(this.controller.forgetPassword);
  }
}

export default JobSeekerAuthRouter;
