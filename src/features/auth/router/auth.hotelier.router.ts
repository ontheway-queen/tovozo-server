import AbstractRouter from "../../../abstract/abstract.router";
import HotelierAuthController from "../controller/auth.hotelier.controller";

export default class HotelierAuthRouter extends AbstractRouter {
  private controller = new HotelierAuthController();
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
        this.authChecker.hotelierAuthChecker,
        this.controller.registration
      );

    //login
    this.router.route("/login").post(this.controller.login);

    this.router.route("/login-data").post(this.controller.loginData);

    //forget password
    this.router.route("/forget-password").post(this.controller.forgetPassword);
  }
}
